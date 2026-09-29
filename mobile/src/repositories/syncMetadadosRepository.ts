import { obterBanco } from '@/database/banco';

/** Chaves usadas na tabela sync_metadados. */
export const CHAVE_ULTIMA_SINCRONIZACAO_TUTORES = 'ultima_sincronizacao_tutores';

export async function obterMetadado(chave: string): Promise<string | null> {
  const banco = await obterBanco();
  const linha = await banco.getFirstAsync<{ valor: string | null }>(
    'SELECT valor FROM sync_metadados WHERE chave = ?',
    [chave],
  );
  return linha?.valor ?? null;
}

export async function salvarMetadado(chave: string, valor: string): Promise<void> {
  const banco = await obterBanco();
  await banco.runAsync(
    `INSERT INTO sync_metadados (chave, valor) VALUES (?, ?)
     ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor`,
    [chave, valor],
  );
}
