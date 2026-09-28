import { z } from 'zod';
import { validarCpf } from '../utils/cpf';

const somenteDigitos = (valor: string) => valor.replace(/\D/g, '');

/** Converte campos opcionais vazios ("" ou ausentes) em null antes de validar. */
function opcional<T extends z.ZodType>(esquema: T) {
  return z.preprocess(
    (valor) => (valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '') ? null : valor),
    esquema.nullable(),
  );
}

const textoOpcional = (maximo: number) => opcional(z.string().trim().max(maximo, `Máximo de ${maximo} caracteres.`));

export const tutorSchema = z.object({
  nome: z.string().trim().min(3, 'O nome deve ter pelo menos 3 caracteres.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  cpf: z.string().transform(somenteDigitos).refine(validarCpf, 'CPF inválido.'),
  telefone: z
    .string()
    .transform(somenteDigitos)
    .refine((valor) => valor.length === 10 || valor.length === 11, 'Informe o telefone com DDD (10 ou 11 dígitos).'),
  email: opcional(z.string().trim().toLowerCase().pipe(z.email('E-mail inválido.'))),
  cep: opcional(z.string().transform(somenteDigitos).refine((valor) => valor.length === 8, 'O CEP deve ter 8 dígitos.')),
  logradouro: textoOpcional(120),
  numero: textoOpcional(20),
  complemento: textoOpcional(60),
  bairro: textoOpcional(60),
  cidade: textoOpcional(60),
  uf: opcional(z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, 'UF deve ter 2 letras.')),
});

export const criarTutorSchema = tutorSchema.extend({
  id: z.uuid('Id deve ser um UUID.').optional(),
});

export const idSchema = z.object({
  id: z.uuid('Id deve ser um UUID.'),
});

export const listarTutoresSchema = z.object({
  busca: z.string().trim().max(100).optional(),
  atualizadosDesde: z.iso.datetime({ offset: true, message: 'atualizadosDesde deve ser uma data ISO 8601.' }).optional(),
});

export type DadosTutorEntrada = z.infer<typeof tutorSchema>;
