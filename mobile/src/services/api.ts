/**
 * Cliente HTTP da API do PetCare.
 * O endereço vem da variável de ambiente EXPO_PUBLIC_API_URL (arquivo .env).
 */
const URL_BASE = process.env.EXPO_PUBLIC_API_URL ?? '';
const TEMPO_LIMITE_MS = 10000;

export interface DetalheErroApi {
  campo: string;
  mensagem: string;
}

/** Erro devolvido pela API no formato { erro: { codigo, mensagem, detalhes } }. */
export class ApiError extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly mensagem: string;
  readonly detalhes: DetalheErroApi[];

  constructor(status: number, codigo: string, mensagem: string, detalhes: DetalheErroApi[] = []) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
    this.mensagem = mensagem;
    this.detalhes = detalhes;
  }
}

/** A requisição não chegou à API (sem internet, servidor desligado, IP errado ou tempo esgotado). */
export class ErroDeRede extends Error {
  constructor(mensagem = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.') {
    super(mensagem);
    this.name = 'ErroDeRede';
  }
}

let tokenAtual: string | null = null;
let aoSessaoExpirar: (() => void) | null = null;

/** Define o token JWT enviado no cabeçalho Authorization (null ao sair). */
export function definirToken(token: string | null): void {
  tokenAtual = token;
}

/** Função chamada quando a API responde 401 a uma requisição autenticada (sessão expirada). */
export function definirAoSessaoExpirar(funcao: (() => void) | null): void {
  aoSessaoExpirar = funcao;
}

interface OpcoesRequisicao {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  corpo?: unknown;
  /** false nas rotas de login e cadastro, que não usam token. */
  autenticada?: boolean;
}

/** Formato do corpo de erro definido no contrato da API (seção 5 da especificação). */
interface CorpoErroApi {
  erro?: { codigo?: string; mensagem?: string; detalhes?: DetalheErroApi[] };
}

function converterEmApiError(status: number, corpo: unknown): ApiError {
  const erro = (corpo as CorpoErroApi | null)?.erro;
  if (erro?.codigo && erro.mensagem) {
    return new ApiError(status, erro.codigo, erro.mensagem, erro.detalhes ?? []);
  }
  return new ApiError(status, 'ERRO_DESCONHECIDO', `O servidor respondeu com um erro inesperado (HTTP ${status}).`);
}

function lerJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

export async function requisicao<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const { metodo = 'GET', corpo, autenticada = true } = opcoes;

  if (!URL_BASE) {
    throw new ErroDeRede('Endereço da API não configurado. Crie o arquivo .env com EXPO_PUBLIC_API_URL.');
  }

  const cabecalhos: Record<string, string> = { Accept: 'application/json' };
  if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json';
  }
  if (autenticada && tokenAtual) {
    cabecalhos.Authorization = `Bearer ${tokenAtual}`;
  }

  // AbortController cancela a requisição se a API não responder dentro do tempo limite.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);

  let status: number;
  let texto: string;
  try {
    const resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: controlador.signal,
    });
    status = resposta.status;
    texto = await resposta.text();
  } catch {
    throw controlador.signal.aborted
      ? new ErroDeRede('O servidor demorou demais para responder. Tente novamente.')
      : new ErroDeRede();
  } finally {
    clearTimeout(temporizador);
  }

  const dados = texto ? lerJson(texto) : null;

  if (status >= 200 && status < 300) {
    return dados as T;
  }

  if (status === 401 && autenticada) {
    aoSessaoExpirar?.();
  }
  throw converterEmApiError(status, dados);
}

/** Texto amigável para mostrar ao usuário a partir de qualquer erro. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError || erro instanceof ErroDeRede) {
    return erro.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
