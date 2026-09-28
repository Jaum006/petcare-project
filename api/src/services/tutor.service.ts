import { randomUUID } from 'node:crypto';
import { tutorModel, type DadosTutor, type Tutor } from '../models/tutor.model';
import { ErroAplicacao } from '../utils/erros';

export interface ResultadoSalvar {
  tutor: Tutor;
  criado: boolean;
}

/** RN01: o CPF não pode pertencer a outro tutor ativo. */
async function garantirCpfDisponivel(cpf: string, idAtual?: string): Promise<void> {
  const outro = await tutorModel.buscarAtivoPorCpf(cpf);
  if (outro && outro.id !== idAtual) {
    throw new ErroAplicacao(409, 'CPF_DUPLICADO', 'Já existe um tutor cadastrado com este CPF.', [
      { campo: 'cpf', mensagem: 'CPF já cadastrado.' },
    ]);
  }
}

async function buscarAtivoOuFalhar(id: string): Promise<Tutor> {
  const tutor = await tutorModel.buscarPorId(id);
  if (!tutor || tutor.excluidoEm) {
    throw new ErroAplicacao(404, 'NAO_ENCONTRADO', 'Tutor não encontrado.');
  }
  return tutor;
}

export const tutorService = {
  listar(busca?: string): Promise<Tutor[]> {
    return tutorModel.listarAtivos(busca);
  },

  listarAlteradosDesde(data: Date): Promise<Tutor[]> {
    return tutorModel.listarAlteradosDesde(data);
  },

  async obter(id: string): Promise<Tutor & { totalPets: number }> {
    const tutor = await buscarAtivoOuFalhar(id);
    const totalPets = await tutorModel.contarPetsAtivos(id);
    return { ...tutor, totalPets };
  },

  async criar(dados: DadosTutor, id: string = randomUUID()): Promise<Tutor> {
    if (await tutorModel.buscarPorId(id)) {
      throw new ErroAplicacao(409, 'ID_DUPLICADO', 'Já existe um tutor com este id.');
    }
    await garantirCpfDisponivel(dados.cpf);
    return tutorModel.criar(id, dados);
  },

  /**
   * Cria ou atualiza o tutor com o id informado (upsert idempotente).
   * É a operação usada pela sincronização do app: reenviar a mesma gravação não gera duplicidade.
   */
  async salvar(id: string, dados: DadosTutor): Promise<ResultadoSalvar> {
    await garantirCpfDisponivel(dados.cpf, id);

    const existente = await tutorModel.buscarPorId(id);
    if (existente) {
      return { tutor: await tutorModel.atualizar(id, dados), criado: false };
    }
    return { tutor: await tutorModel.criar(id, dados), criado: true };
  },

  /** RN02: tutor com pets vinculados não pode ser excluído. */
  async excluir(id: string): Promise<void> {
    await buscarAtivoOuFalhar(id);

    const totalPets = await tutorModel.contarPetsAtivos(id);
    if (totalPets > 0) {
      throw new ErroAplicacao(
        409,
        'TUTOR_COM_PETS',
        `Não é possível excluir: o tutor possui ${totalPets} pet(s) vinculado(s).`,
      );
    }

    await tutorModel.excluirLogicamente(id);
  },
};
