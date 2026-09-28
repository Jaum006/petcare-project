import type { NextFunction, Request, Response } from 'express';

/** Registra no terminal cada requisição recebida, com status e tempo de resposta. */
export function registrarRequisicoes(req: Request, res: Response, next: NextFunction): void {
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
}
