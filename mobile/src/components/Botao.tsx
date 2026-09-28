import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { cores, espacamento, fontes, raios, TAMANHO_MINIMO_TOQUE } from '@/theme';

import { Icone, type NomeIcone } from './Icone';

type VarianteBotao = 'primario' | 'secundario' | 'perigo';

interface BotaoProps {
  titulo: string;
  aoPressionar: () => void;
  variante?: VarianteBotao;
  icone?: NomeIcone;
  carregando?: boolean;
  desabilitado?: boolean;
  /** Texto lido pelo leitor de tela; por padrão é o próprio título. */
  rotuloAcessibilidade?: string;
  /** Explica ao leitor de tela o que acontece ao tocar. */
  dicaAcessibilidade?: string;
}

const CORES_VARIANTE: Record<VarianteBotao, { fundo: string; texto: string; borda: string }> = {
  primario: { fundo: cores.primaria, texto: cores.branco, borda: cores.primaria },
  secundario: { fundo: cores.branco, texto: cores.primaria, borda: cores.primaria },
  perigo: { fundo: cores.perigo, texto: cores.branco, borda: cores.perigo },
};

export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  rotuloAcessibilidade,
  dicaAcessibilidade,
}: BotaoProps) {
  const inativo = desabilitado || carregando;
  const corVariante = CORES_VARIANTE[variante];

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessibilidade ?? titulo}
      accessibilityHint={dicaAcessibilidade}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: corVariante.fundo, borderColor: corVariante.borda },
        pressed && styles.pressionado,
        inativo && styles.inativo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corVariante.texto} />
      ) : (
        icone && <Icone name={icone} size={20} color={corVariante.texto} />
      )}
      <Text style={[styles.texto, { color: corVariante.texto }]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: TAMANHO_MINIMO_TOQUE,
    borderRadius: raios.md,
    borderWidth: 2,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.sm,
  },
  pressionado: {
    opacity: 0.85,
  },
  inativo: {
    opacity: 0.6,
  },
  texto: {
    fontSize: fontes.normal,
    fontWeight: '700',
  },
});
