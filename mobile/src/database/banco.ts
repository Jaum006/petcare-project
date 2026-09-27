import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { executarMigracoes } from './migracoes';

const NOME_ARQUIVO_BANCO = 'petcare.db';

let conexao: Promise<SQLiteDatabase> | null = null;

async function abrirBanco(): Promise<SQLiteDatabase> {
  const banco = await openDatabaseAsync(NOME_ARQUIVO_BANCO);
  await executarMigracoes(banco);
  return banco;
}

/**
 * Devolve a conexão com o SQLite local. O banco é aberto (e migrado) só na primeira
 * chamada; as chamadas seguintes reutilizam a mesma conexão.
 */
export function obterBanco(): Promise<SQLiteDatabase> {
  if (!conexao) {
    conexao = abrirBanco().catch((erro) => {
      conexao = null;
      throw erro;
    });
  }
  return conexao;
}
