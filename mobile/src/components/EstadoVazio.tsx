import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espacamento, fontes, raios } from '@/theme';

import { Icone, type NomeIcone } from './Icone';

interface EstadoVazioProps {
  icone: NomeIcone;
  titulo: string;
  mensagem: string;
  /** Ação opcional exibida abaixo do texto (ex.: um botão). */
  children?: ReactNode;
}

/** Mensagem centralizada para listas vazias e módulos ainda não disponíveis. */
export function EstadoVazio({ icone, titulo, mensagem, children }: EstadoVazioProps) {
  return (
    <View style={styles.container}>
      <View style={styles.circulo}>
        <Icone name={icone} size={44} color={cores.primaria} />
      </View>
      <Text style={styles.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={styles.mensagem}>{mensagem}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamento.xl,
    gap: espacamento.sm,
  },
  circulo: {
    width: 88,
    height: 88,
    borderRadius: raios.redondo,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamento.sm,
  },
  titulo: {
    fontSize: fontes.media,
    fontWeight: '700',
    color: cores.texto,
    textAlign: 'center',
  },
  mensagem: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: espacamento.sm,
  },
});
