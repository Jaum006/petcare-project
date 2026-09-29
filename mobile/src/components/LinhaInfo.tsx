import { StyleSheet, Text, View } from 'react-native';

import { cores, fontes } from '@/theme';

/** Par "rótulo: valor" lido de uma vez pelo leitor de tela. */
export function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.linha} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    gap: 2,
  },
  rotulo: {
    fontSize: fontes.pequena,
    color: cores.textoSecundario,
  },
  valor: {
    fontSize: fontes.normal,
    color: cores.texto,
  },
});
