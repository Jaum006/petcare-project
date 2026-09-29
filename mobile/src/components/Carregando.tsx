import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores, espacamento, fontes } from '@/theme';

export function Carregando({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <View style={styles.container} accessible accessibilityRole="progressbar" accessibilityLabel={mensagem}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.md,
    padding: espacamento.xl,
  },
  texto: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
  },
});
