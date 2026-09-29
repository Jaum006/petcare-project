/** Tutor como a API envia e recebe (camelCase). CPF, telefone e CEP só com dígitos. */
export interface Tutor {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
}

/** Campos que o usuário preenche no formulário (sem id e sem datas). */
export type DadosTutor = Omit<Tutor, 'id' | 'criadoEm' | 'atualizadoEm' | 'excluidoEm'>;

/** Situação do registro local em relação à API. */
export type SyncStatus = 'sincronizado' | 'pendente' | 'erro';

/** O que precisa ser enviado para a API na próxima sincronização. */
export type SyncOperacao = 'upsert' | 'delete';

/** Tutor guardado no SQLite do celular: dados + controle de sincronização. */
export interface TutorLocal extends Tutor {
  syncStatus: SyncStatus;
  syncOperacao: SyncOperacao | null;
  syncErro: string | null;
}
