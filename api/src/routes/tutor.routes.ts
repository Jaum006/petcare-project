import { Router } from 'express';
import { tutorController } from '../controllers/tutor.controller';
import { autenticar, autorizar } from '../middlewares/autenticacao';

export const tutorRoutes = Router();

tutorRoutes.use(autenticar);

tutorRoutes.get('/', tutorController.listar);
tutorRoutes.get('/:id', tutorController.obter);
tutorRoutes.post('/', autorizar('RECEPCAO'), tutorController.criar);
tutorRoutes.put('/:id', autorizar('RECEPCAO'), tutorController.salvar);
tutorRoutes.delete('/:id', autorizar('RECEPCAO'), tutorController.excluir);
