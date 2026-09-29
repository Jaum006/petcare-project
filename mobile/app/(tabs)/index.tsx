import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartaoResumo } from '@/components/CartaoResumo';
import { CartaoSincronizacao } from '@/components/CartaoSincronizacao';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/contexts/AuthContext';
import { useTotalTutores } from '@/hooks/useTutores';
import { NOMES_PERFIL } from '@/types/usuario';
import { cores, espacamento, fontes, raios } from '@/theme';

export default function TelaInicio() {
  const { usuario } = useAuth();
  const totalTutores = useTotalTutores();

  if (!usuario) {
    return null;
  }

  const ehRecepcao = usuario.perfil === 'RECEPCAO';

  return (
    <Tela>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.saudacao}>
          <Text style={styles.ola} accessibilityRole="header">
            Olá, {usuario.nome}
          </Text>
          <View
            style={[styles.badgePerfil, ehRecepcao ? styles.badgeRecepcao : styles.badgeVeterinario]}
            accessible
            accessibilityLabel={`Perfil: ${NOMES_PERFIL[usuario.perfil]}`}
          >
            <Text style={[styles.textoPerfil, { color: ehRecepcao ? cores.primariaEscura : cores.secundariaTexto }]}>
              {NOMES_PERFIL[usuario.perfil]}
            </Text>
          </View>
        </View>

        <View style={styles.grade}>
          <CartaoResumo
            titulo="Tutores"
            valor={totalTutores === null ? '...' : String(totalTutores)}
            icone="people"
            cor={cores.primaria}
            corFundo={cores.primariaClara}
          />
          <CartaoResumo
            titulo="Pets"
            valor="—"
            legenda="Ciclo 2"
            icone="paw"
            cor={cores.secundaria}
            corFundo={cores.secundariaClara}
          />
          <CartaoResumo
            titulo="Consultas"
            valor="—"
            legenda="Ciclo 3"
            icone="calendar"
            cor={cores.alertaTexto}
            corFundo={cores.alertaClara}
          />
          <CartaoResumo
            titulo="Veterinários"
            valor="—"
            legenda="Ciclo 2"
            icone="medkit"
            cor={cores.perigoTexto}
            corFundo={cores.perigoClara}
          />
        </View>

        <CartaoSincronizacao />
      </ScrollView>
    </Tela>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: espacamento.md,
  },
  saudacao: {
    marginBottom: espacamento.lg,
    gap: espacamento.sm,
  },
  ola: {
    fontSize: fontes.grande,
    fontWeight: '700',
    color: cores.texto,
  },
  badgePerfil: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.xs,
    borderRadius: raios.redondo,
  },
  badgeRecepcao: {
    backgroundColor: cores.primariaClara,
  },
  badgeVeterinario: {
    backgroundColor: cores.secundariaClara,
  },
  textoPerfil: {
    fontSize: fontes.pequena,
    fontWeight: '700',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.sm,
    marginBottom: espacamento.md,
  },
});
