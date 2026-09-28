import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cores, espacamento, fontes, raios, TAMANHO_MINIMO_TOQUE } from '@/theme';

interface CampoTextoProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'style'> {
  rotulo: string;
  valor: string;
  aoAlterar: (texto: string) => void;
  erro?: string;
  obrigatorio?: boolean;
  /** Texto de ajuda mostrado embaixo do campo quando não há erro. */
  dica?: string;
  /** Elemento exibido à direita do campo (ex.: botão "Buscar" do CEP). */
  acessorio?: ReactNode;
}

/** Campo de texto com rótulo visível e mensagem de erro logo abaixo, associada ao campo. */
export function CampoTexto({
  rotulo,
  valor,
  aoAlterar,
  erro,
  obrigatorio = false,
  dica,
  acessorio,
  editable = true,
  ...propsDoInput
}: CampoTextoProps) {
  const [focado, setFocado] = useState(false);

  const rotuloAcessivel = obrigatorio ? `${rotulo}, obrigatório` : rotulo;

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>
        {rotulo}
        {obrigatorio && <Text style={styles.asterisco}> *</Text>}
      </Text>
      <View style={styles.linha}>
        <TextInput
          {...propsDoInput}
          value={valor}
          onChangeText={aoAlterar}
          editable={editable}
          accessibilityLabel={rotuloAcessivel}
          accessibilityHint={erro ? `Erro: ${erro}` : dica}
          accessibilityState={{ disabled: !editable }}
          placeholderTextColor={cores.textoSuave}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          style={[
            styles.entrada,
            focado && styles.entradaFocada,
            !!erro && styles.entradaComErro,
            !editable && styles.entradaDesabilitada,
          ]}
        />
        {acessorio}
      </View>
      {erro ? (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : (
        !!dica && <Text style={styles.dica}>{dica}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: espacamento.md,
  },
  rotulo: {
    fontSize: fontes.normal,
    fontWeight: '600',
    color: cores.texto,
    marginBottom: espacamento.xs,
  },
  asterisco: {
    color: cores.perigoTexto,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
  },
  entrada: {
    flex: 1,
    minHeight: TAMANHO_MINIMO_TOQUE,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    borderRadius: raios.sm,
    paddingHorizontal: espacamento.md,
    fontSize: fontes.normal,
    color: cores.texto,
    backgroundColor: cores.branco,
  },
  entradaFocada: {
    borderColor: cores.primaria,
    borderWidth: 2,
  },
  entradaComErro: {
    borderColor: cores.perigo,
    borderWidth: 2,
  },
  entradaDesabilitada: {
    backgroundColor: cores.fundoSecundario,
    color: cores.textoSecundario,
  },
  erro: {
    marginTop: espacamento.xs,
    color: cores.perigoTexto,
    fontSize: fontes.pequena,
    fontWeight: '600',
  },
  dica: {
    marginTop: espacamento.xs,
    color: cores.textoSecundario,
    fontSize: fontes.pequena,
  },
});
