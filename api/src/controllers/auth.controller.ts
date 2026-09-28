import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { cadastroSchema, loginSchema } from '../validators/auth.validator';

export const authController = {
  async cadastrar(req: Request, res: Response): Promise<void> {
    const dados = cadastroSchema.parse(req.body);
    const sessao = await authService.cadastrar(dados);
    res.status(201).json(sessao);
  },

  async entrar(req: Request, res: Response): Promise<void> {
    const dados = loginSchema.parse(req.body);
    const sessao = await authService.entrar(dados);
    res.json(sessao);
  },

  async usuarioAtual(req: Request, res: Response): Promise<void> {
    const usuario = await authService.obterUsuario(req.usuario!.id);
    res.json({ usuario });
  },
};
