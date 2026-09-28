import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ErroAplicacao } from '../utils/erros';

export function rotaNaoEncontrada(req: Request, _res: Response, next: NextFunction): void {
  next(new ErroAplicacao(404, 'NAO_ENCONTRADO', `Rota ${req.method} ${req.path} não existe.`));
}

/** Converte qualquer erro lançado nas rotas no formato padrão { erro: { codigo, mensagem, detalhes } }. */
export function tratarErros(erro: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (erro instanceof ErroAplicacao) {
    res.status(erro.status).json({
      erro: { codigo: erro.codigo, mensagem: erro.message, detalhes: erro.detalhes },
    });
    return;
  }

  if (erro instanceof ZodError) {
    res.status(400).json({
      erro: {
        codigo: 'VALIDACAO',
        mensagem: 'Dados inválidos. Verifique os campos informados.',
        detalhes: erro.issues.map((issue) => ({ campo: issue.path.join('.'), mensagem: issue.message })),
      },
    });
    return;
  }

  // P2002: o banco recusou um valor único repetido (ex.: duas requisições simultâneas com o mesmo e-mail).
  if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
    const campoEmail = String(erro.meta?.target ?? '').includes('email');
    res.status(409).json({
      erro: {
        codigo: campoEmail ? 'EMAIL_DUPLICADO' : 'ID_DUPLICADO',
        mensagem: campoEmail ? 'Já existe um usuário com este e-mail.' : 'Já existe um registro com este id.',
        detalhes: [],
      },
    });
    return;
  }

  const erroJsonMalFormado = erro instanceof SyntaxError && 'type' in erro && erro.type === 'entity.parse.failed';
  if (erroJsonMalFormado) {
    res.status(400).json({ erro: { codigo: 'VALIDACAO', mensagem: 'O corpo da requisição não é um JSON válido.', detalhes: [] } });
    return;
  }

  console.error(erro);
  res.status(500).json({ erro: { codigo: 'ERRO_INTERNO', mensagem: 'Erro inesperado no servidor.', detalhes: [] } });
}
