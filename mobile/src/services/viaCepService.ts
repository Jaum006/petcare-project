/**
 * Integração com o ViaCEP (requisito R7): preenche o endereço a partir do CEP.
 * Documentação: https://viacep.com.br
 */
const TEMPO_LIMITE_MS = 8000;

export interface EnderecoViaCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

/** Campos da resposta do ViaCEP que o app usa. Para CEP inexistente a resposta é { "erro": true }. */
interface RespostaViaCep {
  erro?: boolean | string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

/**
 * Busca o endereço de um CEP (8 dígitos, sem máscara).
 * Devolve null se o CEP não existir, se estiver sem internet ou se o serviço falhar:
 * nesses casos o usuário preenche o endereço manualmente.
 */
export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoViaCep | null> {
  if (!/^\d{8}$/.test(cep)) {
    return null;
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controlador.signal });
    if (!resposta.ok) {
      return null;
    }
    const dados = (await resposta.json()) as RespostaViaCep;
    if (dados.erro) {
      return null;
    }
    return {
      logradouro: dados.logradouro ?? '',
      bairro: dados.bairro ?? '',
      cidade: dados.localidade ?? '',
      uf: dados.uf ?? '',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}
