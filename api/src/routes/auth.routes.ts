import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { autenticar } from '../middlewares/autenticacao';

export const authRoutes = Router();

authRoutes.post('/cadastro', authController.cadastrar);
authRoutes.post('/login', authController.entrar);
authRoutes.get('/me', autenticar, authController.usuarioAtual);
