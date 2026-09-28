export type CodigoErro =
  | 'VALIDACAO'
  | 'NAO_AUTENTICADO'
  | 'CREDENCIAIS_INVALIDAS'
  | 'SEM_PERMISSAO'
  | 'NAO_ENCONTRADO'
  | 'EMAIL_DUPLICADO'
  | 'CPF_DUPLICADO'
  | 'ID_DUPLICADO'
  | 'TUTOR_COM_PETS'
  | 'ERRO_INTERNO';

export interface DetalheErro {
  campo: string;
  mensagem: string;
}

/**
 * Erro esperado da aplicação (regra de negócio, permissão, recurso inexistente).
 * O middleware de erros converte em resposta HTTP com o status e o código informados.
 */
export class ErroAplicacao extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: CodigoErro,
    mensagem: string,
    public readonly detalhes: DetalheErro[] = [],
  ) {
    super(mensagem);
    this.name = 'ErroAplicacao';
  }
}
