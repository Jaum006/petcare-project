import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { cores } from '@/theme';

import { BannerOffline } from './BannerOffline';

/** Estrutura base das telas logadas: aviso de offline no topo e o conteúdo abaixo. */
export function Tela({ children }: { children: ReactNode }) {
  return (
    <View style={styles.tela}>
      <BannerOffline />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundoSecundario,
  },
});
