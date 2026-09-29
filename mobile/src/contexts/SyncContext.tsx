import NetInfo from '@react-native-community/netinfo';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { mensagemDeErro } from '@/services/api';
import {
  obterResumoSincronizacao,
  sincronizarTutores,
  type ResultadoSincronizacao,
  type ResumoSincronizacao,
} from '@/services/syncService';

import { useAuth } from './AuthContext';

interface ValorSincronizacao extends ResumoSincronizacao {
  sincronizando: boolean;
  /** Mensagem da última falha (sem conexão, servidor fora do ar...). null se a última deu certo. */
  ultimoErro: string | null;
  /** Aumenta a cada sincronização concluída; as telas usam para recarregar os dados locais. */
  versaoDados: number;
  /** Executa a sincronização. Devolve null se ela falhou (o motivo fica em ultimoErro). */
  sincronizar: () => Promise<ResultadoSincronizacao | null>;
}

const SyncContext = createContext<ValorSincronizacao | null>(null);

/** Explica ao usuário por que um tutor excluído voltou a aparecer (ex.: RN02, tutor com pets). */
function avisarExclusoesRecusadas(resultado: ResultadoSincronizacao) {
  const recusadas = resultado.recusados.filter((recusa) => recusa.operacao === 'delete');
  if (recusadas.length > 0) {
    Alert.alert(
      'Exclusão não realizada',
      recusadas.map((recusa) => `${recusa.nome}: ${recusa.mensagem}`).join('\n\n'),
    );
  }
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const idUsuario = usuario?.id ?? null;

  const [sincronizando, setSincronizando] = useState(false);
  const [ultimoErro, setUltimoErro] = useState<string | null>(null);
  const [versaoDados, setVersaoDados] = useState(0);
  const [resumo, setResumo] = useState<ResumoSincronizacao>({
    pendentes: 0,
    comErro: 0,
    ultimaSincronizacao: null,
  });

  const atualizarResumo = useCallback(async () => {
    const novoResumo = await obterResumoSincronizacao();
    setResumo(novoResumo);
  }, []);

  const sincronizar = useCallback(async () => {
    setSincronizando(true);
    let resultado: ResultadoSincronizacao | null = null;
    try {
      resultado = await sincronizarTutores();
      setUltimoErro(null);
      avisarExclusoesRecusadas(resultado);
    } catch (erro) {
      setUltimoErro(mensagemDeErro(erro));
    }
    await atualizarResumo();
    setVersaoDados((versao) => versao + 1);
    setSincronizando(false);
    return resultado;
  }, [atualizarResumo]);

  // Gatilhos automáticos: ao entrar no app (abertura ou login) e quando a conexão volta.
  // O NetInfo chama a função logo após a inscrição (com o estado atual) e depois a cada mudança.
  useEffect(() => {
    if (!idUsuario) {
      return;
    }

    let estavaConectado: boolean | null = null;
    const pararDeOuvir = NetInfo.addEventListener((estado) => {
      const conectado = estado.isConnected !== false;
      const primeiraChamada = estavaConectado === null;

      if (conectado && estavaConectado !== true) {
        sincronizar();
      } else if (primeiraChamada) {
        // Abriu o app sem conexão: só mostra quantos registros estão pendentes.
        atualizarResumo();
      }
      estavaConectado = conectado;
    });
    return pararDeOuvir;
  }, [idUsuario, sincronizar, atualizarResumo]);

  const valor = useMemo(
    () => ({ ...resumo, sincronizando, ultimoErro, versaoDados, sincronizar }),
    [resumo, sincronizando, ultimoErro, versaoDados, sincronizar],
  );

  return <SyncContext.Provider value={valor}>{children}</SyncContext.Provider>;
}

export function useSincronizacao(): ValorSincronizacao {
  const contexto = useContext(SyncContext);
  if (!contexto) {
    throw new Error('useSincronizacao deve ser usado dentro de <SyncProvider>.');
  }
  return contexto;
}
