import { somenteDigitos } from './mascaras';

/**
 * Calcula um dígito verificador do CPF.
 * Cada dígito da base é multiplicado por um peso decrescente (10, 9, 8... ou 11, 10, 9...),
 * os resultados são somados e o dígito é o resto de (soma × 10) ÷ 11 (10 vira 0).
 */
function calcularDigitoVerificador(base: string, pesoInicial: number): number {
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (pesoInicial - i);
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/** RN01: verifica se o CPF tem 11 dígitos e dígitos verificadores corretos. Aceita com ou sem máscara. */
export function validarCpf(cpf: string): boolean {
  const digitos = somenteDigitos(cpf);

  if (digitos.length !== 11) {
    return false;
  }

  // CPFs com todos os dígitos iguais (ex.: 111.111.111-11) passam no cálculo, mas são inválidos.
  if (/^(\d)\1{10}$/.test(digitos)) {
    return false;
  }

  const primeiroDigito = calcularDigitoVerificador(digitos.slice(0, 9), 10);
  const segundoDigito = calcularDigitoVerificador(digitos.slice(0, 10), 11);

  return primeiroDigito === Number(digitos[9]) && segundoDigito === Number(digitos[10]);
}
