import type { z } from 'zod';

/** Mensagens de erro indexadas pelo nome do campo, para exibir embaixo de cada input. */
export type ErrosDeCampo = Partial<Record<string, string>>;

/** Converte o erro do Zod em { campo: primeiraMensagem }. */
export function errosPorCampo(erro: z.ZodError): ErrosDeCampo {
  const erros: ErrosDeCampo = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? 'geral');
    if (!erros[campo]) {
      erros[campo] = problema.message;
    }
  }
  return erros;
}

/** Converte os "detalhes" de um erro VALIDACAO da API ([{ campo, mensagem }]) em erros de campo. */
export function errosDosDetalhesDaApi(detalhes: { campo: string; mensagem: string }[]): ErrosDeCampo {
  const erros: ErrosDeCampo = {};
  for (const detalhe of detalhes) {
    erros[detalhe.campo] = detalhe.mensagem;
  }
  return erros;
}
