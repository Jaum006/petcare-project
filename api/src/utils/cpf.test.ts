import { describe, expect, it } from 'vitest';
import { validarCpf } from './cpf';

describe('validarCpf (RN01)', () => {
  it('aceita CPFs válidos com e sem máscara', () => {
    expect(validarCpf('52998224725')).toBe(true);
    expect(validarCpf('529.982.247-25')).toBe(true);
    expect(validarCpf('123.456.789-09')).toBe(true);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(validarCpf('52998224724')).toBe(false);
    expect(validarCpf('12345678900')).toBe(false);
  });

  it('rejeita sequências de dígitos repetidos', () => {
    expect(validarCpf('00000000000')).toBe(false);
    expect(validarCpf('111.111.111-11')).toBe(false);
  });

  it('rejeita tamanhos diferentes de 11 dígitos', () => {
    expect(validarCpf('')).toBe(false);
    expect(validarCpf('5299822472')).toBe(false);
    expect(validarCpf('529982247250')).toBe(false);
  });
});
