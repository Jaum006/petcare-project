import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { definirAoSessaoExpirar } from '@/services/api';
import * as authService from '@/services/authService';
import type { DadosCadastroUsuario, Usuario } from '@/types/usuario';

interface ValorAutenticacao {
  usuario: Usuario | null;
  /** true enquanto a sessão salva no celular está sendo lida (splash screen visível). */
  carregando: boolean;
  /** Mensagem exibida na tela de login, ex.: sessão expirada. */
  aviso: string | null;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: DadosCadastroUsuario) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<ValorAutenticacao | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  // Ao abrir o app, restaura a sessão salva (funciona offline).
  useEffect(() => {
    authService
      .restaurarSessao()
      .then((sessao) => setUsuario(sessao?.usuario ?? null))
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  // Se a API responder 401 (token expirado ou inválido), encerra a sessão.
  useEffect(() => {
    definirAoSessaoExpirar(() => {
      setAviso('Sua sessão expirou. Entre novamente para continuar.');
      setUsuario(null);
      authService.sair();
    });
    return () => definirAoSessaoExpirar(null);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const sessao = await authService.entrar(email, senha);
    setAviso(null);
    setUsuario(sessao.usuario);
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastroUsuario) => {
    const sessao = await authService.cadastrar(dados);
    setAviso(null);
    setUsuario(sessao.usuario);
  }, []);

  const sair = useCallback(async () => {
    await authService.sair();
    setAviso(null);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, aviso, entrar, cadastrar, sair }),
    [usuario, carregando, aviso, entrar, cadastrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): ValorAutenticacao {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return contexto;
}
