import * as SecureStore from 'expo-secure-store';

import type { DadosCadastroUsuario, Sessao } from '@/types/usuario';

import { ApiError, definirToken, requisicao } from './api';

/** Chave do SecureStore (armazenamento criptografado do celular) onde a sessão fica salva. */
const CHAVE_SESSAO = 'petcare.sessao';

/** Guarda a sessão no celular e passa a enviar o token nas requisições. */
async function iniciarSessao(sessao: Sessao): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(sessao));
  definirToken(sessao.token);
}

/**
 * Lê a sessão salva no celular. Funciona sem internet: se houver sessão, o usuário entra
 * direto no app. Se o token tiver expirado, a API responderá 401 e o app fará logout.
 */
export async function restaurarSessao(): Promise<Sessao | null> {
  const texto = await SecureStore.getItemAsync(CHAVE_SESSAO);
  if (!texto) {
    return null;
  }
  try {
    const sessao = JSON.parse(texto) as Sessao;
    if (!sessao.token || !sessao.usuario) {
      return null;
    }
    definirToken(sessao.token);
    return sessao;
  } catch {
    return null;
  }
}

export async function entrar(email: string, senha: string): Promise<Sessao> {
  try {
    const sessao = await requisicao<Sessao>('/auth/login', {
      metodo: 'POST',
      corpo: { email, senha },
      autenticada: false,
    });
    await iniciarSessao(sessao);
    return sessao;
  } catch (erro) {
    if (erro instanceof ApiError && erro.codigo === 'CREDENCIAIS_INVALIDAS') {
      throw new ApiError(erro.status, erro.codigo, 'E-mail ou senha inválidos.');
    }
    throw erro;
  }
}

export async function cadastrar(dados: DadosCadastroUsuario): Promise<Sessao> {
  const sessao = await requisicao<Sessao>('/auth/cadastro', {
    metodo: 'POST',
    corpo: dados,
    autenticada: false,
  });
  await iniciarSessao(sessao);
  return sessao;
}

/** Apaga a sessão do celular. Os dados locais (tutores e pendências) são mantidos. */
export async function sair(): Promise<void> {
  definirToken(null);
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
}
