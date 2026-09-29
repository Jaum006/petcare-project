import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espacamento, fontes, raios } from '@/theme';

/** Bloco com borda e título opcional, usado para agrupar informações. */
export function Cartao({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <View style={styles.cartao}>
      {!!titulo && (
        <Text style={styles.titulo} accessibilityRole="header">
          {titulo}
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.md,
    marginBottom: espacamento.md,
    gap: espacamento.sm,
  },
  titulo: {
    fontSize: fontes.media,
    fontWeight: '700',
    color: cores.texto,
    marginBottom: espacamento.xs,
  },
});
