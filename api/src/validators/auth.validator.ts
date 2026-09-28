import { z } from 'zod';

export const PERFIS = ['RECEPCAO', 'VETERINARIO'] as const;
export type Perfil = (typeof PERFIS)[number];

const email = z.string().trim().toLowerCase().pipe(z.email('E-mail inválido.'));

export const cadastroSchema = z.object({
  nome: z.string().trim().min(3, 'O nome deve ter pelo menos 3 caracteres.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email,
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').max(72, 'A senha deve ter no máximo 72 caracteres.'),
  perfil: z.enum(PERFIS, 'Perfil deve ser RECEPCAO ou VETERINARIO.'),
});

export const loginSchema = z.object({
  email,
  senha: z.string().min(1, 'Informe a senha.'),
});

export type DadosCadastro = z.infer<typeof cadastroSchema>;
export type DadosLogin = z.infer<typeof loginSchema>;
