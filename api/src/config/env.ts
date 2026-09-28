import 'dotenv/config';
import { z } from 'zod';

const esquemaAmbiente = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL não definida'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),
});

const resultado = esquemaAmbiente.safeParse(process.env);

if (!resultado.success) {
  const problemas = resultado.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Variáveis de ambiente inválidas. Confira o arquivo .env:\n${problemas.join('\n')}`);
}

export const env = resultado.data;
