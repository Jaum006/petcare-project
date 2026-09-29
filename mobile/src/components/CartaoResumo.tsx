import { StyleSheet, Text, View } from 'react-native';

import { cores, espacamento, fontes, raios } from '@/theme';

import { Icone, type NomeIcone } from './Icone';

interface CartaoResumoProps {
  titulo: string;
  valor: string;
  icone: NomeIcone;
  /** Cor do ícone e fundo claro atrás dele. */
  cor: string;
  corFundo: string;
  legenda?: string;
}

/** Cartão do painel inicial com um número (ex.: total de tutores). */
export function CartaoResumo({ titulo, valor, icone, cor, corFundo, legenda }: CartaoResumoProps) {
  const descricao = legenda ? `${titulo}: ${valor}. ${legenda}` : `${titulo}: ${valor}`;

  return (
    <View style={styles.cartao} accessible accessibilityLabel={descricao}>
      <View style={[styles.icone, { backgroundColor: corFundo }]}>
        <Icone name={icone} size={24} color={cor} />
      </View>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!legenda && <Text style={styles.legenda}>{legenda}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: cores.branco,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.md,
    gap: espacamento.xs,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamento.sm,
  },
  valor: {
    fontSize: fontes.titulo,
    fontWeight: '700',
    color: cores.texto,
  },
  titulo: {
    fontSize: fontes.normal,
    fontWeight: '600',
    color: cores.texto,
  },
  legenda: {
    fontSize: fontes.pequena,
    color: cores.textoSecundario,
  },
});
