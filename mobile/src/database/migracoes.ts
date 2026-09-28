import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Migrações do banco local. A posição no array é a versão: MIGRACOES[0] leva o banco
 * da versão 0 para a 1, MIGRACOES[1] da 1 para a 2, e assim por diante.
 * A versão atual fica gravada no próprio arquivo do SQLite (PRAGMA user_version).
 * Nunca altere uma migração que já foi instalada nos celulares: crie uma nova no final.
 */
const MIGRACOES: string[] = [
  `
  CREATE TABLE tutores (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT,
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    criado_em TEXT NOT NULL,
    atualizado_em TEXT NOT NULL,
    excluido_em TEXT,
    sync_status TEXT NOT NULL CHECK (sync_status IN ('sincronizado', 'pendente', 'erro')),
    sync_operacao TEXT CHECK (sync_operacao IN ('upsert', 'delete')),
    sync_erro TEXT
  );
  CREATE INDEX idx_tutores_nome ON tutores (nome);
  CREATE INDEX idx_tutores_cpf ON tutores (cpf);
  CREATE INDEX idx_tutores_sync_status ON tutores (sync_status);

  CREATE TABLE sync_metadados (
    chave TEXT PRIMARY KEY NOT NULL,
    valor TEXT
  );
  `,
];

export async function executarMigracoes(banco: SQLiteDatabase): Promise<void> {
  // WAL deixa leituras e gravações acontecerem ao mesmo tempo sem travar a tela.
  await banco.execAsync("PRAGMA journal_mode = 'wal';");

  const resultado = await banco.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let versaoAtual = resultado?.user_version ?? 0;

  while (versaoAtual < MIGRACOES.length) {
    const migracao = MIGRACOES[versaoAtual];
    const proximaVersao = versaoAtual + 1;
    await banco.withTransactionAsync(async () => {
      await banco.execAsync(migracao);
      await banco.execAsync(`PRAGMA user_version = ${proximaVersao}`);
    });
    versaoAtual = proximaVersao;
  }
}
