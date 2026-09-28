import * as tutorRepository from '@/repositories/tutorRepository';
import { errosPorCampo, type ErrosDeCampo } from '@/validation/erros';
import { tutorSchema, type DadosFormularioTutor } from '@/validation/tutorSchema';

export type ResultadoSalvarTutor = { sucesso: true; id: string } | { sucesso: false; erros: ErrosDeCampo };

/**
 * Valida e grava o tutor no SQLite local (offline-first).
 * O envio para a API é feito depois, pela sincronização.
 */
export async function salvarTutor(valores: DadosFormularioTutor, idExistente?: string): Promise<ResultadoSalvarTutor> {
  const validacao = tutorSchema.safeParse(valores);
  if (!validacao.success) {
    return { sucesso: false, erros: errosPorCampo(validacao.error) };
  }
  const dados = validacao.data;

  // RN01 (segunda parte): o CPF não pode estar cadastrado para outro tutor.
  if (await tutorRepository.cpfJaCadastrado(dados.cpf, idExistente)) {
    return { sucesso: false, erros: { cpf: 'Já existe um tutor cadastrado com este CPF.' } };
  }

  const id = await tutorRepository.salvarTutor(dados, idExistente);
  return { sucesso: true, id };
}

/** Marca o tutor para exclusão. A API confirma (ou recusa) a exclusão na sincronização. */
export async function excluirTutor(id: string): Promise<void> {
  await tutorRepository.marcarParaExclusao(id);
}
