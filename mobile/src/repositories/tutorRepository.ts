import { randomUUID } from 'expo-crypto';

import { obterBanco } from '@/database/banco';
import type { DadosTutor, SyncOperacao, SyncStatus, Tutor, TutorLocal } from '@/types/tutor';
import { somenteDigitos } from '@/validation/mascaras';

/** Linha da tabela "tutores" como vem do SQLite (snake_case). */
interface LinhaTutor {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  criado_em: string;
  atualizado_em: string;
  excluido_em: string | null;
  sync_status: SyncStatus;
  sync_operacao: SyncOperacao | null;
  sync_erro: string | null;
}

function linhaParaTutor(linha: LinhaTutor): TutorLocal {
  return {
    id: linha.id,
    nome: linha.nome,
    cpf: linha.cpf,
    telefone: linha.telefone,
    email: linha.email,
    cep: linha.cep,
    logradouro: linha.logradouro,
    numero: linha.numero,
    complemento: linha.complemento,
    bairro: linha.bairro,
    cidade: linha.cidade,
    uf: linha.uf,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
    excluidoEm: linha.excluido_em,
    syncStatus: linha.sync_status,
    syncOperacao: linha.sync_operacao,
    syncErro: linha.sync_erro,
  };
}

/** Parâmetros nomeados com os dados do tutor, usados nos INSERT/UPDATE abaixo. */
function parametrosDosDados(dados: DadosTutor) {
  return {
    $nome: dados.nome,
    $cpf: dados.cpf,
    $telefone: dados.telefone,
    $email: dados.email,
    $cep: dados.cep,
    $logradouro: dados.logradouro,
    $numero: dados.numero,
    $complemento: dados.complemento,
    $bairro: dados.bairro,
    $cidade: dados.cidade,
    $uf: dados.uf,
  };
}

const LETRAS_ACENTUADAS: Record<string, string> = {
  á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a', é: 'e', è: 'e', ê: 'e', ë: 'e', í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o', ö: 'o', ú: 'u', ù: 'u', û: 'u', ü: 'u', ç: 'c', ñ: 'n',
};

/** Deixa o texto em minúsculas e sem acentos para comparar (ex.: "João" → "joao"). */
function normalizar(texto: string): string {
  return texto.toLowerCase().replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, (letra) => LETRAS_ACENTUADAS[letra]);
}

/**
 * Lista os tutores não excluídos, em ordem alfabética, filtrando por nome, CPF ou e-mail.
 * O filtro e a ordenação são feitos aqui, e não no SQL, porque o SQLite não trata acentos:
 * "Ângela" ficaria depois de "Zeca" e a busca "joao" não encontraria "João".
 */
export async function listarTutores(busca = ''): Promise<TutorLocal[]> {
  const banco = await obterBanco();
  const linhas = await banco.getAllAsync<LinhaTutor>('SELECT * FROM tutores WHERE excluido_em IS NULL');
  const tutores = linhas.map(linhaParaTutor);

  const termo = normalizar(busca.trim());
  // Só compara com o CPF quando o texto parece um CPF (apenas dígitos, pontos, traço ou espaços).
  const digitosCpf = /^[\d.\-\s]+$/.test(termo) ? somenteDigitos(termo) : '';
  const encontrados = termo
    ? tutores.filter(
        (tutor) =>
          normalizar(tutor.nome).includes(termo) ||
          normalizar(tutor.email ?? '').includes(termo) ||
          (digitosCpf !== '' && tutor.cpf.includes(digitosCpf)),
      )
    : tutores;

  return encontrados.sort((a, b) => {
    const nomeA = normalizar(a.nome);
    const nomeB = normalizar(b.nome);
    return nomeA < nomeB ? -1 : nomeA > nomeB ? 1 : 0;
  });
}

export async function buscarTutorPorId(id: string): Promise<TutorLocal | null> {
  const banco = await obterBanco();
  const linha = await banco.getFirstAsync<LinhaTutor>(
    'SELECT * FROM tutores WHERE id = ? AND excluido_em IS NULL',
    [id],
  );
  return linha ? linhaParaTutor(linha) : null;
}

export async function contarTutores(): Promise<number> {
  const banco = await obterBanco();
  const resultado = await banco.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM tutores WHERE excluido_em IS NULL',
  );
  return resultado?.total ?? 0;
}

export async function contarPorStatusSync(status: SyncStatus): Promise<number> {
  const banco = await obterBanco();
  const resultado = await banco.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM tutores WHERE sync_status = ?',
    [status],
  );
  return resultado?.total ?? 0;
}

/** RN01: verifica se outro tutor não excluído já usa este CPF. */
export async function cpfJaCadastrado(cpf: string, idIgnorado?: string): Promise<boolean> {
  const banco = await obterBanco();
  const linha = await banco.getFirstAsync<{ id: string }>(
    'SELECT id FROM tutores WHERE cpf = ? AND excluido_em IS NULL AND id <> ? LIMIT 1',
    [cpf, idIgnorado ?? ''],
  );
  return linha !== null;
}

/**
 * Grava o tutor no SQLite (inclusão quando não recebe id, alteração quando recebe).
 * O registro fica "pendente" com operação "upsert" até a sincronização enviá-lo à API.
 * Devolve o id do tutor.
 */
export async function salvarTutor(dados: DadosTutor, idExistente?: string): Promise<string> {
  const banco = await obterBanco();
  const agora = new Date().toISOString();

  if (idExistente) {
    await banco.runAsync(
      `UPDATE tutores SET
         nome = $nome, cpf = $cpf, telefone = $telefone, email = $email, cep = $cep,
         logradouro = $logradouro, numero = $numero, complemento = $complemento,
         bairro = $bairro, cidade = $cidade, uf = $uf,
         atualizado_em = $agora,
         sync_status = 'pendente', sync_operacao = 'upsert', sync_erro = NULL
       WHERE id = $id`,
      { ...parametrosDosDados(dados), $agora: agora, $id: idExistente },
    );
    return idExistente;
  }

  const id = randomUUID();
  await banco.runAsync(
    `INSERT INTO tutores (
       id, nome, cpf, telefone, email, cep, logradouro, numero, complemento, bairro, cidade, uf,
       criado_em, atualizado_em, excluido_em, sync_status, sync_operacao, sync_erro
     ) VALUES (
       $id, $nome, $cpf, $telefone, $email, $cep, $logradouro, $numero, $complemento, $bairro, $cidade, $uf,
       $agora, $agora, NULL, 'pendente', 'upsert', NULL
     )`,
    { ...parametrosDosDados(dados), $agora: agora, $id: id },
  );
  return id;
}

/**
 * Exclusão lógica: preenche excluido_em (o tutor some das listas) e deixa a exclusão
 * pendente para a sincronização enviar o DELETE à API.
 */
export async function marcarParaExclusao(id: string): Promise<void> {
  const banco = await obterBanco();
  const agora = new Date().toISOString();
  await banco.runAsync(
    `UPDATE tutores SET
       excluido_em = $agora, atualizado_em = $agora,
       sync_status = 'pendente', sync_operacao = 'delete', sync_erro = NULL
     WHERE id = $id`,
    { $agora: agora, $id: id },
  );
}

/** Registros que precisam ser enviados à API. Registros com "erro" só voltam a ser enviados após nova edição. */
export async function listarPendentes(): Promise<TutorLocal[]> {
  const banco = await obterBanco();
  const linhas = await banco.getAllAsync<LinhaTutor>(
    "SELECT * FROM tutores WHERE sync_status = 'pendente' ORDER BY atualizado_em",
  );
  return linhas.map(linhaParaTutor);
}

/**
 * Marca o registro como sincronizado depois que a API aceitou o envio.
 * A condição em atualizado_em evita perder uma edição feita enquanto a requisição estava em andamento:
 * nesse caso o registro continua pendente e vai na próxima sincronização.
 */
export async function marcarSincronizado(id: string, atualizadoEmEnviado: string): Promise<void> {
  const banco = await obterBanco();
  await banco.runAsync(
    `UPDATE tutores SET sync_status = 'sincronizado', sync_operacao = NULL, sync_erro = NULL
     WHERE id = ? AND atualizado_em = ?`,
    [id, atualizadoEmEnviado],
  );
}

/**
 * Guarda a mensagem de erro da API quando ela recusa uma inclusão ou alteração por regra de negócio
 * (ex.: CPF duplicado). O registro não é reenviado até o usuário corrigir e salvar de novo.
 */
export async function marcarErro(id: string, mensagem: string, atualizadoEmEnviado: string): Promise<void> {
  const banco = await obterBanco();
  await banco.runAsync(
    `UPDATE tutores SET sync_status = 'erro', sync_operacao = NULL, sync_erro = ?
     WHERE id = ? AND atualizado_em = ?`,
    [mensagem, id, atualizadoEmEnviado],
  );
}

/**
 * A API recusou a exclusão (ex.: RN02, tutor com pets) e manteve o tutor.
 * O registro volta a aparecer como sincronizado, igual ao que está no servidor.
 */
export async function restaurarExclusaoRecusada(id: string, atualizadoEmEnviado: string): Promise<void> {
  const banco = await obterBanco();
  await banco.runAsync(
    `UPDATE tutores SET excluido_em = NULL, sync_status = 'sincronizado', sync_operacao = NULL, sync_erro = NULL
     WHERE id = ? AND atualizado_em = ?`,
    [id, atualizadoEmEnviado],
  );
}

/** Remove o registro do celular (usado depois que a API confirmou a exclusão). */
export async function removerDefinitivamente(id: string): Promise<void> {
  const banco = await obterBanco();
  await banco.runAsync('DELETE FROM tutores WHERE id = ?', [id]);
}

/**
 * Aplica no SQLite os tutores recebidos da API na sincronização.
 * Registros com alteração local ainda não aceita (pendente ou erro) não são sobrescritos:
 * o "WHERE sync_status = 'sincronizado'" garante isso nas duas operações.
 */
export async function aplicarDoServidor(tutores: Tutor[]): Promise<void> {
  const banco = await obterBanco();

  await banco.withTransactionAsync(async () => {
    for (const tutor of tutores) {
      if (tutor.excluidoEm) {
        await banco.runAsync("DELETE FROM tutores WHERE id = ? AND sync_status = 'sincronizado'", [
          tutor.id,
        ]);
        continue;
      }

      await banco.runAsync(
        `INSERT INTO tutores (
           id, nome, cpf, telefone, email, cep, logradouro, numero, complemento, bairro, cidade, uf,
           criado_em, atualizado_em, excluido_em, sync_status, sync_operacao, sync_erro
         ) VALUES (
           $id, $nome, $cpf, $telefone, $email, $cep, $logradouro, $numero, $complemento, $bairro, $cidade, $uf,
           $criadoEm, $atualizadoEm, NULL, 'sincronizado', NULL, NULL
         )
         ON CONFLICT (id) DO UPDATE SET
           nome = excluded.nome, cpf = excluded.cpf, telefone = excluded.telefone,
           email = excluded.email, cep = excluded.cep, logradouro = excluded.logradouro,
           numero = excluded.numero, complemento = excluded.complemento, bairro = excluded.bairro,
           cidade = excluded.cidade, uf = excluded.uf,
           criado_em = excluded.criado_em, atualizado_em = excluded.atualizado_em, excluido_em = NULL
         WHERE tutores.sync_status = 'sincronizado'`,
        {
          ...parametrosDosDados(tutor),
          $id: tutor.id,
          $criadoEm: tutor.criadoEm,
          $atualizadoEm: tutor.atualizadoEm,
        },
      );
    }
  });
}
