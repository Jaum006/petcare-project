import { StyleSheet, Text, View } from 'react-native';

import { cores, espacamento, fontes, raios } from '@/theme';

import { Icone, type NomeIcone } from './Icone';

type TipoAviso = 'erro' | 'alerta' | 'info';

const APARENCIA: Record<TipoAviso, { fundo: string; texto: string; icone: NomeIcone }> = {
  erro: { fundo: cores.perigoClara, texto: cores.perigoTexto, icone: 'alert-circle-outline' },
  alerta: { fundo: cores.alertaClara, texto: cores.alertaTexto, icone: 'warning-outline' },
  info: { fundo: cores.primariaClara, texto: cores.primariaEscura, icone: 'information-circle-outline' },
};

/** Caixa de mensagem (erro, alerta ou informação), anunciada pelo leitor de tela quando aparece. */
export function Aviso({ tipo, mensagem }: { tipo: TipoAviso; mensagem: string }) {
  const aparencia = APARENCIA[tipo];
  return (
    <View
      style={[styles.caixa, { backgroundColor: aparencia.fundo }]}
      accessible
      accessibilityRole={tipo === 'info' ? 'text' : 'alert'}
      accessibilityLiveRegion="polite"
    >
      <Icone name={aparencia.icone} size={22} color={aparencia.texto} />
      <Text style={[styles.texto, { color: aparencia.texto }]}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamento.sm,
    padding: espacamento.md,
    borderRadius: raios.md,
    marginBottom: espacamento.md,
  },
  texto: {
    flex: 1,
    fontSize: fontes.normal,
    lineHeight: 22,
  },
});
