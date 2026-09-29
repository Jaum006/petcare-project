import { StyleSheet, Text, View } from 'react-native';

import { useOnline } from '@/hooks/useOnline';
import { cores, espacamento, fontes } from '@/theme';

import { Icone } from './Icone';

/** Faixa exibida no topo das telas quando o celular está sem conexão. */
export function BannerOffline() {
  const online = useOnline();

  if (online) {
    return null;
  }

  return (
    <View style={styles.banner} accessible accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icone name="cloud-offline-outline" size={22} color={cores.alertaTexto} />
      <Text style={styles.texto}>
        Você está offline — as alterações serão enviadas quando a conexão voltar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.sm,
    backgroundColor: cores.alertaClara,
    borderBottomWidth: 2,
    borderBottomColor: cores.alerta,
  },
  texto: {
    flex: 1,
    color: cores.alertaTexto,
    fontSize: fontes.pequena,
    fontWeight: '600',
  },
});
