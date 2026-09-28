import type { Tutor } from '@prisma/client';
import { prisma } from './prisma';

export type { Tutor };

export type DadosTutor = Omit<Tutor, 'id' | 'criadoEm' | 'atualizadoEm' | 'excluidoEm'>;

export const tutorModel = {
  listarAtivos(busca?: string): Promise<Tutor[]> {
    // Só busca por CPF quando o texto parece um CPF (apenas dígitos, pontos, traço ou espaços).
    const buscaPorCpf = busca && /^[\d.\-\s]+$/.test(busca) ? busca.replace(/\D/g, '') : null;
    return prisma.tutor.findMany({
      where: {
        excluidoEm: null,
        ...(busca && {
          OR: [
            { nome: { contains: busca } },
            { email: { contains: busca.toLowerCase() } },
            ...(buscaPorCpf ? [{ cpf: { contains: buscaPorCpf } }] : []),
          ],
        }),
      },
      orderBy: { nome: 'asc' },
    });
  },

  /** Inclui excluídos: é o que permite ao app remover localmente o que foi excluído no servidor. */
  listarAlteradosDesde(data: Date): Promise<Tutor[]> {
    return prisma.tutor.findMany({
      where: { atualizadoEm: { gt: data } },
      orderBy: { atualizadoEm: 'asc' },
    });
  },

  buscarPorId(id: string): Promise<Tutor | null> {
    return prisma.tutor.findUnique({ where: { id } });
  },

  buscarAtivoPorCpf(cpf: string): Promise<Tutor | null> {
    return prisma.tutor.findFirst({ where: { cpf, excluidoEm: null } });
  },

  contarPetsAtivos(tutorId: string): Promise<number> {
    return prisma.pet.count({ where: { tutorId, excluidoEm: null } });
  },

  criar(id: string, dados: DadosTutor): Promise<Tutor> {
    return prisma.tutor.create({ data: { id, ...dados } });
  },

  /** Atualiza os dados e reativa o registro caso ele tenha sido excluído (última gravação prevalece). */
  atualizar(id: string, dados: DadosTutor): Promise<Tutor> {
    return prisma.tutor.update({ where: { id }, data: { ...dados, excluidoEm: null } });
  },

  excluirLogicamente(id: string): Promise<Tutor> {
    return prisma.tutor.update({ where: { id }, data: { excluidoEm: new Date() } });
  },
};
