import { z } from 'zod';

import { validarCpf } from './cpf';

/** Campo de texto opcional: remove espaços nas pontas e guarda null quando fica vazio. */
function textoOpcional(maximo: number) {
  return z
    .string()
    .trim()
    .max(maximo, `Use no máximo ${maximo} caracteres.`)
    .transform((valor) => valor || null);
}

/**
 * Regras do cadastro de tutor (seção 3 da especificação).
 * CPF, telefone e CEP chegam aqui só com dígitos (o formulário guarda os valores sem máscara).
 * A unicidade do CPF (segunda parte da RN01) é verificada no tutorService, pois consulta o banco.
 */
export const tutorSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'Informe o nome com pelo menos 3 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  cpf: z.string().min(1, 'Informe o CPF.').refine(validarCpf, 'CPF inválido. Confira os números digitados.'),
  telefone: z
    .string()
    .min(1, 'Informe o telefone.')
    .regex(/^\d{10,11}$/, 'Informe o telefone com DDD (10 ou 11 dígitos).'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.union([z.literal(''), z.email('E-mail inválido.')]))
    .transform((valor) => valor || null),
  cep: z
    .string()
    .regex(/^(\d{8})?$/, 'O CEP deve ter 8 dígitos.')
    .transform((valor) => valor || null),
  logradouro: textoOpcional(120),
  numero: textoOpcional(20),
  complemento: textoOpcional(60),
  bairro: textoOpcional(60),
  cidade: textoOpcional(60),
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^([A-Z]{2})?$/, 'Informe a UF com 2 letras (ex.: GO).')
    .transform((valor) => valor || null),
});

/** Valores do formulário: todos os campos como texto. */
export type DadosFormularioTutor = z.input<typeof tutorSchema>;
