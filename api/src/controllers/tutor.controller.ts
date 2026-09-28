import type { Request, Response } from 'express';
import { tutorService } from '../services/tutor.service';
import { criarTutorSchema, idSchema, listarTutoresSchema, tutorSchema } from '../validators/tutor.validator';

export const tutorController = {
  async listar(req: Request, res: Response): Promise<void> {
    // Hora do servidor capturada antes da consulta: alterações feitas durante a consulta
    // serão entregues na próxima sincronização em vez de se perderem.
    const servidorEm = new Date().toISOString();
    const { busca, atualizadosDesde } = listarTutoresSchema.parse(req.query);

    const dados = atualizadosDesde
      ? await tutorService.listarAlteradosDesde(new Date(atualizadosDesde))
      : await tutorService.listar(busca);

    res.json({ dados, servidorEm });
  },

  async obter(req: Request, res: Response): Promise<void> {
    const { id } = idSchema.parse(req.params);
    res.json(await tutorService.obter(id));
  },

  async criar(req: Request, res: Response): Promise<void> {
    const { id, ...dados } = criarTutorSchema.parse(req.body);
    const tutor = await tutorService.criar(dados, id);
    res.status(201).json(tutor);
  },

  async salvar(req: Request, res: Response): Promise<void> {
    const { id } = idSchema.parse(req.params);
    const dados = tutorSchema.parse(req.body);
    const { tutor, criado } = await tutorService.salvar(id, dados);
    res.status(criado ? 201 : 200).json(tutor);
  },

  async excluir(req: Request, res: Response): Promise<void> {
    const { id } = idSchema.parse(req.params);
    await tutorService.excluir(id);
    res.status(204).send();
  },
};
