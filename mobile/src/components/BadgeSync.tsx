import { StyleSheet, Text, View } from 'react-native';

import type { SyncStatus } from '@/types/tutor';
import { cores, espacamento, fontes, raios } from '@/theme';

import { Icone } from './Icone';

export const TEXTO_STATUS_SYNC: Record<SyncStatus, string> = {
  sincronizado: 'Sincronizado',
  pendente: 'Aguardando envio',
  erro: 'Erro ao sincronizar',
};

/** Selo que mostra se o registro ainda não foi enviado ou se a API recusou o envio. */
export function BadgeSync({ status }: { status: SyncStatus }) {
  if (status === 'sincronizado') {
    return null;
  }

  const pendente = status === 'pendente';
  const corTexto = pendente ? cores.alertaTexto : cores.perigoTexto;

  return (
    <View style={[styles.badge, { backgroundColor: pendente ? cores.alertaClara : cores.perigoClara }]}>
      <Icone name={pendente ? 'time-outline' : 'alert-circle-outline'} size={14} color={corTexto} />
      <Text style={[styles.texto, { color: corTexto }]}>{TEXTO_STATUS_SYNC[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.xs,
    paddingHorizontal: espacamento.sm,
    paddingVertical: 2,
    borderRadius: raios.redondo,
    marginTop: espacamento.xs,
  },
  texto: {
    fontSize: fontes.pequena,
    fontWeight: '600',
  },
});
