import { z } from 'zod';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Informe o e-mail.')
  .pipe(z.email('Informe um e-mail válido.'));

export const loginSchema = z.object({
  email,
  senha: z.string().min(1, 'Informe a senha.'),
});

/** Regras do Usuario (seção 3 da especificação): nome 3–100 caracteres, senha com no mínimo 6. */
export const cadastroSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, 'Informe o nome com pelo menos 3 caracteres.')
      .max(100, 'O nome deve ter no máximo 100 caracteres.'),
    email,
    senha: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres.')
      .max(72, 'A senha deve ter no máximo 72 caracteres.'),
    confirmarSenha: z.string().min(1, 'Confirme a senha.'),
    perfil: z.enum(['RECEPCAO', 'VETERINARIO'], 'Selecione o seu perfil.'),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    error: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  });

export type FormularioLogin = z.input<typeof loginSchema>;
export type FormularioCadastro = z.input<typeof cadastroSchema>;
