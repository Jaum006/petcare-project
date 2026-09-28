import type { Usuario } from '@prisma/client';
import { prisma } from './prisma';

export type { Usuario };

export interface NovoUsuario {
  nome: string;
  email: string;
  senhaHash: string;
  perfil: string;
}

export const usuarioModel = {
  buscarPorEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  },

  buscarPorId(id: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { id } });
  },

  criar(dados: NovoUsuario): Promise<Usuario> {
    return prisma.usuario.create({ data: dados });
  },
};
