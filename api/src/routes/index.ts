import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { tutorRoutes } from './tutor.routes';

export const rotas = Router();

rotas.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

rotas.use('/auth', authRoutes);
rotas.use('/tutores', tutorRoutes);
