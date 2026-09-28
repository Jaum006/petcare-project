import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DadosTutor, Tutor } from '../models/tutor.model';
import { tutorModel } from '../models/tutor.model';
import { ErroAplicacao } from '../utils/erros';
import { tutorService } from './tutor.service';

vi.mock('../models/tutor.model', () => ({
  tutorModel: {
    buscarPorId: vi.fn(),
    buscarAtivoPorCpf: vi.fn(),
    contarPetsAtivos: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    excluirLogicamente: vi.fn(),
  },
}));

const modelo = vi.mocked(tutorModel);

const dados: DadosTutor = {
  nome: 'Ana Paula Martins',
  cpf: '52998224725',
  telefone: '62991234567',
  email: null,
  cep: null,
  logradouro: null,
  numero: null,
  complemento: null,
  bairro: null,
  cidade: null,
  uf: null,
};

function tutor(sobrescrever: Partial<Tutor> = {}): Tutor {
  return { id: 'tutor-1', ...dados, criadoEm: new Date(), atualizadoEm: new Date(), excluidoEm: null, ...sobrescrever };
}

async function capturarErro(promessa: Promise<unknown>): Promise<ErroAplicacao> {
  const erro = await promessa.catch((e: unknown) => e);
  expect(erro).toBeInstanceOf(ErroAplicacao);
  return erro as ErroAplicacao;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('tutorService.criar', () => {
  it('RN01: rejeita CPF já usado por outro tutor ativo', async () => {
    modelo.buscarPorId.mockResolvedValue(null);
    modelo.buscarAtivoPorCpf.mockResolvedValue(tutor({ id: 'outro' }));

    const erro = await capturarErro(tutorService.criar(dados, 'novo'));

    expect(erro.status).toBe(409);
    expect(erro.codigo).toBe('CPF_DUPLICADO');
    expect(modelo.criar).not.toHaveBeenCalled();
  });

  it('cria o tutor quando o CPF está disponível', async () => {
    modelo.buscarPorId.mockResolvedValue(null);
    modelo.buscarAtivoPorCpf.mockResolvedValue(null);
    modelo.criar.mockResolvedValue(tutor({ id: 'novo' }));

    const criado = await tutorService.criar(dados, 'novo');

    expect(criado.id).toBe('novo');
    expect(modelo.criar).toHaveBeenCalledWith('novo', dados);
  });
});

describe('tutorService.salvar (upsert da sincronização)', () => {
  it('permite manter o próprio CPF ao atualizar', async () => {
    modelo.buscarAtivoPorCpf.mockResolvedValue(tutor());
    modelo.buscarPorId.mockResolvedValue(tutor());
    modelo.atualizar.mockResolvedValue(tutor({ nome: 'Ana Paula' }));

    const resultado = await tutorService.salvar('tutor-1', { ...dados, nome: 'Ana Paula' });

    expect(resultado.criado).toBe(false);
    expect(modelo.atualizar).toHaveBeenCalled();
  });

  it('cria quando o id ainda não existe no servidor', async () => {
    modelo.buscarAtivoPorCpf.mockResolvedValue(null);
    modelo.buscarPorId.mockResolvedValue(null);
    modelo.criar.mockResolvedValue(tutor());

    const resultado = await tutorService.salvar('tutor-1', dados);

    expect(resultado.criado).toBe(true);
  });
});

describe('tutorService.excluir', () => {
  it('RN02: impede excluir tutor com pets vinculados', async () => {
    modelo.buscarPorId.mockResolvedValue(tutor());
    modelo.contarPetsAtivos.mockResolvedValue(2);

    const erro = await capturarErro(tutorService.excluir('tutor-1'));

    expect(erro.status).toBe(409);
    expect(erro.codigo).toBe('TUTOR_COM_PETS');
    expect(modelo.excluirLogicamente).not.toHaveBeenCalled();
  });

  it('exclui logicamente tutor sem pets', async () => {
    modelo.buscarPorId.mockResolvedValue(tutor());
    modelo.contarPetsAtivos.mockResolvedValue(0);

    await tutorService.excluir('tutor-1');

    expect(modelo.excluirLogicamente).toHaveBeenCalledWith('tutor-1');
  });

  it('retorna 404 para tutor já excluído', async () => {
    modelo.buscarPorId.mockResolvedValue(tutor({ excluidoEm: new Date() }));

    const erro = await capturarErro(tutorService.excluir('tutor-1'));

    expect(erro.status).toBe(404);
  });
});
