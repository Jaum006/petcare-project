import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TutorLocal } from '@/types/tutor';
import { cores, espacamento, fontes, raios, TAMANHO_MINIMO_TOQUE } from '@/theme';
import { formatarCpf, formatarTelefone } from '@/validation/mascaras';

import { BadgeSync, TEXTO_STATUS_SYNC } from './BadgeSync';
import { Icone } from './Icone';

interface ItemTutorProps {
  tutor: TutorLocal;
  aoPressionar: () => void;
}

/** Linha da lista de tutores. */
export function ItemTutor({ tutor, aoPressionar }: ItemTutorProps) {
  const cpf = formatarCpf(tutor.cpf);
  const telefone = formatarTelefone(tutor.telefone);
  const situacao = tutor.syncStatus === 'sincronizado' ? '' : `. ${TEXTO_STATUS_SYNC[tutor.syncStatus]}`;

  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={`${tutor.nome}, CPF ${cpf}, telefone ${telefone}${situacao}`}
      accessibilityHint="Abre os detalhes do tutor"
      style={({ pressed }) => [styles.item, pressed && styles.pressionado]}
    >
      <View style={styles.avatar}>
        <Icone name="person-outline" size={22} color={cores.primaria} />
      </View>
      <View style={styles.conteudo}>
        <Text style={styles.nome} numberOfLines={1}>
          {tutor.nome}
        </Text>
        <Text style={styles.detalhe}>CPF {cpf}</Text>
        <Text style={styles.detalhe}>{telefone}</Text>
        <BadgeSync status={tutor.syncStatus} />
      </View>
      <Icone name="chevron-forward" size={20} color={cores.textoSuave} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: TAMANHO_MINIMO_TOQUE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    backgroundColor: cores.branco,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.md,
  },
  pressionado: {
    backgroundColor: cores.primariaClara,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: raios.redondo,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    flex: 1,
    gap: 2,
  },
  nome: {
    fontSize: fontes.normal,
    fontWeight: '700',
    color: cores.texto,
  },
  detalhe: {
    fontSize: fontes.pequena,
    color: cores.textoSecundario,
  },
});
