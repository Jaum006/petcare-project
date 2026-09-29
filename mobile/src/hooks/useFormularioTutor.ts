import { useState } from 'react';

import { useSincronizacao } from '@/contexts/SyncContext';
import { salvarTutor } from '@/services/tutorService';
import { buscarEnderecoPorCep } from '@/services/viaCepService';
import type { TutorLocal } from '@/types/tutor';
import type { ErrosDeCampo } from '@/validation/erros';
import { somenteDigitos } from '@/validation/mascaras';
import type { DadosFormularioTutor } from '@/validation/tutorSchema';

export type CampoTutor = keyof DadosFormularioTutor;

const FORMULARIO_VAZIO: DadosFormularioTutor = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

/** Campos guardados só com dígitos: a máscara é aplicada apenas na exibição. */
const LIMITE_DE_DIGITOS: Partial<Record<CampoTutor, number>> = {
  cpf: 11,
  telefone: 11,
  cep: 8,
};

function valoresDoTutor(tutor: TutorLocal): DadosFormularioTutor {
  return {
    nome: tutor.nome,
    cpf: tutor.cpf,
    telefone: tutor.telefone,
    email: tutor.email ?? '',
    cep: tutor.cep ?? '',
    logradouro: tutor.logradouro ?? '',
    numero: tutor.numero ?? '',
    complemento: tutor.complemento ?? '',
    bairro: tutor.bairro ?? '',
    cidade: tutor.cidade ?? '',
    uf: tutor.uf ?? '',
  };
}

const MENSAGEM_FALHA_CEP = 'Não foi possível buscar o CEP — preencha o endereço manualmente.';

/** Estado e ações do formulário de tutor (inclusão quando não recebe tutor, edição quando recebe). */
export function useFormularioTutor(tutor?: TutorLocal) {
  const { sincronizar } = useSincronizacao();
  const [valores, setValores] = useState<DadosFormularioTutor>(() =>
    tutor ? valoresDoTutor(tutor) : FORMULARIO_VAZIO,
  );
  const [erros, setErros] = useState<ErrosDeCampo>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState<string | null>(null);

  function limparErro(campo: CampoTutor) {
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  async function buscarCep(cep: string) {
    if (cep.length !== 8) {
      setErros((atuais) => ({ ...atuais, cep: 'Digite os 8 números do CEP para buscar.' }));
      return;
    }
    setBuscandoCep(true);
    setAvisoCep(null);
    const endereco = await buscarEnderecoPorCep(cep);
    setBuscandoCep(false);

    if (!endereco) {
      setAvisoCep(MENSAGEM_FALHA_CEP);
      return;
    }
    // Se o usuário trocou o CEP enquanto a busca acontecia, a resposta antiga é ignorada.
    setValores((atuais) =>
      atuais.cep !== cep
        ? atuais
        : {
            ...atuais,
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            uf: endereco.uf,
          },
    );
    limparErro('uf');
  }

  function alterarCampo(campo: CampoTutor, texto: string) {
    const limite = LIMITE_DE_DIGITOS[campo];
    const valor = limite ? somenteDigitos(texto).slice(0, limite) : texto;

    setValores((atuais) => ({ ...atuais, [campo]: valor }));
    limparErro(campo);
    setErroGeral(null);

    // Busca automática no ViaCEP quando o CEP fica completo.
    if (campo === 'cep') {
      setAvisoCep(null);
      if (valor.length === 8 && valor !== valores.cep) {
        buscarCep(valor);
      }
    }
  }

  /** Valida e grava no celular. Devolve true se salvou; a sincronização continua em segundo plano. */
  async function salvar(): Promise<boolean> {
    setSalvando(true);
    setErroGeral(null);
    try {
      const resultado = await salvarTutor(valores, tutor?.id);
      if (!resultado.sucesso) {
        setErros(resultado.erros);
        setErroGeral('Corrija os campos destacados antes de salvar.');
        return false;
      }
      sincronizar();
      return true;
    } catch {
      setErroGeral('Não foi possível salvar o tutor no celular. Tente novamente.');
      return false;
    } finally {
      setSalvando(false);
    }
  }

  return {
    valores,
    erros,
    erroGeral,
    salvando,
    buscandoCep,
    avisoCep,
    alterarCampo,
    buscarCep: () => buscarCep(valores.cep),
    salvar,
  };
}
