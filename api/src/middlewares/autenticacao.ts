import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ErroAplicacao } from '../utils/erros';
import type { Perfil } from '../validators/auth.validator';

/** Exige um token JWT válido no cabeçalho Authorization: Bearer <token>. */
export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new ErroAplicacao(401, 'NAO_AUTENTICADO', 'Faça login para continuar.');
  }

  try {
    const conteudo = authService.verificarToken(token);
    req.usuario = { id: conteudo.sub, nome: conteudo.nome, perfil: conteudo.perfil };
  } catch {
    throw new ErroAplicacao(401, 'NAO_AUTENTICADO', 'Sessão expirada ou inválida. Entre novamente.');
  }

  next();
}

/** RN03: restringe a rota aos perfis informados. Deve ser usado depois de `autenticar`. */
export function autorizar(...perfisPermitidos: Perfil[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario || !perfisPermitidos.includes(req.usuario.perfil)) {
      throw new ErroAplicacao(403, 'SEM_PERMISSAO', 'Seu perfil não tem permissão para esta ação.');
    }
    next();
  };
}
