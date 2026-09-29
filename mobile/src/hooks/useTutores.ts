import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSincronizacao } from '@/contexts/SyncContext';
import { buscarTutorPorId, contarTutores, listarTutores } from '@/repositories/tutorRepository';
import type { TutorLocal } from '@/types/tutor';

/*
 * Hooks de leitura dos tutores no SQLite local.
 * Os dados são recarregados quando a tela fica visível (ex.: ao voltar do formulário)
 * e sempre que uma sincronização termina (versaoDados muda).
 *
 * A variável "ignorar" descarta respostas antigas: se o usuário digitar outra busca antes
 * da consulta anterior terminar, o React executa a limpeza do efeito e o resultado velho é ignorado.
 */

export function useListaTutores(busca: string) {
  const telaVisivel = useIsFocused();
  const { versaoDados } = useSincronizacao();
  const [tutores, setTutores] = useState<TutorLocal[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!telaVisivel) {
      return;
    }
    let ignorar = false;
    listarTutores(busca)
      .then((lista) => {
        if (!ignorar) {
          setTutores(lista);
        }
      })
      .catch(() => {
        if (!ignorar) {
          setTutores([]);
        }
      })
      .finally(() => {
        if (!ignorar) {
          setCarregando(false);
        }
      });
    return () => {
      ignorar = true;
    };
  }, [telaVisivel, busca, versaoDados]);

  return { tutores, carregando };
}

export function useTutor(id: string) {
  const telaVisivel = useIsFocused();
  const { versaoDados } = useSincronizacao();
  const [tutor, setTutor] = useState<TutorLocal | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!telaVisivel) {
      return;
    }
    let ignorar = false;
    buscarTutorPorId(id)
      .then((encontrado) => {
        if (!ignorar) {
          setTutor(encontrado);
        }
      })
      .catch(() => {
        if (!ignorar) {
          setTutor(null);
        }
      })
      .finally(() => {
        if (!ignorar) {
          setCarregando(false);
        }
      });
    return () => {
      ignorar = true;
    };
  }, [telaVisivel, id, versaoDados]);

  return { tutor, carregando };
}

export function useTotalTutores(): number | null {
  const telaVisivel = useIsFocused();
  const { versaoDados } = useSincronizacao();
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!telaVisivel) {
      return;
    }
    let ignorar = false;
    contarTutores().then((quantidade) => {
      if (!ignorar) {
        setTotal(quantidade);
      }
    });
    return () => {
      ignorar = true;
    };
  }, [telaVisivel, versaoDados]);

  return total;
}
