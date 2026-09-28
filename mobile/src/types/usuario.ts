export type Perfil = 'RECEPCAO' | 'VETERINARIO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

/** Resposta de login e cadastro da API. */
export interface Sessao {
  token: string;
  usuario: Usuario;
}

export interface DadosCadastroUsuario {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}

export const NOMES_PERFIL: Record<Perfil, string> = {
  RECEPCAO: 'Recepção',
  VETERINARIO: 'Veterinário',
};
