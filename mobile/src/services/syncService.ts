import NetInfo from '@react-native-community/netinfo';

import {
  CHAVE_ULTIMA_SINCRONIZACAO_TUTORES,
  obterMetadado,
  salvarMetadado,
} from '@/repositories/syncMetadadosRepository';
import * as tutorRepository from '@/repositories/tutorRepository';
import type { SyncOperacao, Tutor, TutorLocal } from '@/types/tutor';

import { ApiError, ErroDeRede, requisicao } from './api';

/**
 * Sincronização app ↔ API (seção 6 da especificação).
 * 1. Envio: cada tutor pendente vai para a API (PUT = inclusão/alteração, DELETE = exclusão).
 * 2. Recebimento: busca na API o que mudou desde a última sincronização e grava no SQLite.
 */

/** Envio recusado pela API por regra de negócio (ex.: CPF duplicado, tutor com pets). */
export interface RecusaSincronizacao {
  id: string;
  nome: string;
  operacao: SyncOperacao | null;
  mensagem: string;
}

export interface ResultadoSincronizacao {
  enviados: number;
  recebidos: number;
  recusados: RecusaSincronizacao[];
}

export interface ResumoSincronizacao {
  pendentes: number;
  comErro: number;
  ultimaSincronizacao: string | null;
}

interface RespostaListaTutores {
  dados: Tutor[];
  servidorEm: string;
}

/** Na primeira sincronização pedimos tudo o que mudou desde 1970, ou seja, todos os tutores. */
const DATA_INICIAL = '1970-01-01T00:00:00.000Z';

/** Corpo do PUT /tutores/:id: os dados do tutor, sem as datas (que são controladas pela API). */
function corpoParaApi(tutor: TutorLocal) {
  return {
    id: tutor.id,
    nome: tutor.nome,
    cpf: tutor.cpf,
    telefone: tutor.telefone,
    email: tutor.email,
    cep: tutor.cep,
    logradouro: tutor.logradouro,
    numero: tutor.numero,
    complemento: tutor.complemento,
    bairro: tutor.bairro,
    cidade: tutor.cidade,
    uf: tutor.uf,
  };
}

/**
 * Erros 4xx são recusas por regra de negócio. Exceções: 401 (sessão expirada) e
 * 403 (o perfil de quem está usando o aparelho não pode enviar a alteração).
 */
function ehRecusaDeRegra(erro: unknown): erro is ApiError {
  return erro instanceof ApiError && erro.status >= 400 && erro.status < 500 && erro.status !== 401 && erro.status !== 403;
}

function mensagemDaRecusa(erro: ApiError): string {
  if (erro.codigo === 'VALIDACAO' && erro.detalhes.length > 0) {
    return `${erro.mensagem} ${erro.detalhes.map((detalhe) => detalhe.mensagem).join(' ')}`;
  }
  return erro.mensagem;
}

async function excluirNaApi(id: string): Promise<void> {
  try {
    await requisicao<void>(`/tutores/${id}`, { metodo: 'DELETE' });
  } catch (erro) {
    // 404: o tutor já não existe na API (ou nunca chegou a ser enviado). A exclusão está concluída.
    if (erro instanceof ApiError && erro.status === 404) {
      return;
    }
    throw erro;
  }
}

async function enviarPendentes(resultado: ResultadoSincronizacao): Promise<void> {
  const pendentes = await tutorRepository.listarPendentes();

  for (const tutor of pendentes) {
    try {
      if (tutor.syncOperacao === 'delete') {
        await excluirNaApi(tutor.id);
        await tutorRepository.removerDefinitivamente(tutor.id);
      } else {
        await requisicao<Tutor>(`/tutores/${tutor.id}`, { metodo: 'PUT', corpo: corpoParaApi(tutor) });
        await tutorRepository.marcarSincronizado(tutor.id, tutor.atualizadoEm);
      }
      resultado.enviados++;
    } catch (erro) {
      // 403: o usuário atual (ex.: um veterinário) não pode enviar as alterações pendentes.
      // Elas continuam guardadas e são enviadas quando alguém da Recepção entrar no aparelho.
      if (erro instanceof ApiError && erro.status === 403) {
        return;
      }
      // Falha do servidor neste registro: ele continua pendente e os demais seguem sendo enviados.
      if (erro instanceof ApiError && erro.status >= 500) {
        continue;
      }
      // Erro de rede ou sessão expirada: interrompe a sincronização; tudo continua pendente.
      if (!ehRecusaDeRegra(erro)) {
        throw erro;
      }
      const mensagem = mensagemDaRecusa(erro);
      if (tutor.syncOperacao === 'delete') {
        // A API manteve o tutor (ex.: RN02, tutor com pets): ele volta a aparecer, igual ao servidor.
        await tutorRepository.restaurarExclusaoRecusada(tutor.id, tutor.atualizadoEm);
      } else {
        await tutorRepository.marcarErro(tutor.id, mensagem, tutor.atualizadoEm);
      }
      resultado.recusados.push({ id: tutor.id, nome: tutor.nome, operacao: tutor.syncOperacao, mensagem });
    }
  }
}

async function receberAlteracoes(resultado: ResultadoSincronizacao): Promise<void> {
  const desde = (await obterMetadado(CHAVE_ULTIMA_SINCRONIZACAO_TUTORES)) ?? DATA_INICIAL;
  const resposta = await requisicao<RespostaListaTutores>(
    `/tutores?atualizadosDesde=${encodeURIComponent(desde)}`,
  );
  await tutorRepository.aplicarDoServidor(resposta.dados);
  await salvarMetadado(CHAVE_ULTIMA_SINCRONIZACAO_TUTORES, resposta.servidorEm);
  resultado.recebidos += resposta.dados.length;
}

async function executarUmaVez(resultado: ResultadoSincronizacao): Promise<void> {
  const conexao = await NetInfo.fetch();
  if (conexao.isConnected === false) {
    throw new ErroDeRede('Sem conexão. As alterações serão enviadas quando a conexão voltar.');
  }
  await enviarPendentes(resultado);
  await receberAlteracoes(resultado);
}

let sincronizacaoEmAndamento: Promise<ResultadoSincronizacao> | null = null;
let repetirAoTerminar = false;

async function executarEnquantoHouverPedidos(): Promise<ResultadoSincronizacao> {
  const resultado: ResultadoSincronizacao = { enviados: 0, recebidos: 0, recusados: [] };
  do {
    repetirAoTerminar = false;
    await executarUmaVez(resultado);
  } while (repetirAoTerminar);
  return resultado;
}

/**
 * Inicia a sincronização. Nunca roda duas ao mesmo tempo: se já houver uma em andamento,
 * marcamos que é preciso repetir (para enviar o que foi gravado agora) e devolvemos a mesma promessa.
 */
export function sincronizarTutores(): Promise<ResultadoSincronizacao> {
  if (sincronizacaoEmAndamento) {
    repetirAoTerminar = true;
    return sincronizacaoEmAndamento;
  }
  sincronizacaoEmAndamento = executarEnquantoHouverPedidos().finally(() => {
    sincronizacaoEmAndamento = null;
  });
  return sincronizacaoEmAndamento;
}

export async function obterResumoSincronizacao(): Promise<ResumoSincronizacao> {
  const [pendentes, comErro, ultimaSincronizacao] = await Promise.all([
    tutorRepository.contarPorStatusSync('pendente'),
    tutorRepository.contarPorStatusSync('erro'),
    obterMetadado(CHAVE_ULTIMA_SINCRONIZACAO_TUTORES),
  ]);
  return { pendentes, comErro, ultimaSincronizacao };
}
