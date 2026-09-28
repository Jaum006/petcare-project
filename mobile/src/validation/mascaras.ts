/** Remove tudo o que não for dígito. Ex.: "529.982.247-25" → "52998224725". */
export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/**
 * Aplica uma máscara em que cada "0" representa um dígito.
 * Funciona enquanto o usuário digita: aplicarMascara("5299", "000.000") → "529.9".
 */
function aplicarMascara(valor: string, mascara: string): string {
  const digitos = somenteDigitos(valor);
  let resultado = '';
  let posicao = 0;

  for (const caractere of mascara) {
    if (posicao >= digitos.length) {
      break;
    }
    if (caractere === '0') {
      resultado += digitos[posicao];
      posicao++;
    } else {
      resultado += caractere;
    }
  }
  return resultado;
}

export function formatarCpf(valor: string): string {
  return aplicarMascara(valor, '000.000.000-00');
}

/** Telefone fixo (10 dígitos) ou celular (11 dígitos), sempre com DDD. */
export function formatarTelefone(valor: string): string {
  const digitos = somenteDigitos(valor);
  const mascara = digitos.length > 10 ? '(00) 00000-0000' : '(00) 0000-0000';
  return aplicarMascara(digitos, mascara);
}

export function formatarCep(valor: string): string {
  return aplicarMascara(valor, '00000-000');
}

/** Converte uma data ISO em "dd/mm/aaaa às hh:mm" no horário do celular. */
export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  const doisDigitos = (numero: number) => String(numero).padStart(2, '0');
  const dia = doisDigitos(data.getDate());
  const mes = doisDigitos(data.getMonth() + 1);
  const hora = doisDigitos(data.getHours());
  const minuto = doisDigitos(data.getMinutes());
  return `${dia}/${mes}/${data.getFullYear()} às ${hora}:${minuto}`;
}
