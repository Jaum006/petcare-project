import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { CartaoSincronizacao } from '@/components/CartaoSincronizacao';
import { Icone } from '@/components/Icone';
import { LinhaInfo } from '@/components/LinhaInfo';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/contexts/AuthContext';
import { useSincronizacao } from '@/contexts/SyncContext';
import { NOMES_PERFIL } from '@/types/usuario';
import { cores, espacamento, fontes, raios, TAMANHO_MINIMO_TOQUE } from '@/theme';

export default function TelaMais() {
  const { usuario, sair } = useAuth();
  const { pendentes } = useSincronizacao();

  if (!usuario) {
    return null;
  }

  function confirmarSaida() {
    const avisoPendencias =
      pendentes > 0
        ? `\n\nHá ${pendentes === 1 ? '1 alteração' : `${pendentes} alterações`} aguardando envio. ` +
          'Elas continuam guardadas no celular e serão enviadas no próximo login de um usuário da Recepção.'
        : '';
    Alert.alert('Sair da conta', `Deseja realmente sair?${avisoPendencias}`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => sair() },
    ]);
  }

  return (
    <Tela>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Cartao titulo="Minha conta">
          <LinhaInfo rotulo="Nome" valor={usuario.nome} />
          <LinhaInfo rotulo="E-mail" valor={usuario.email} />
          <LinhaInfo rotulo="Perfil" valor={NOMES_PERFIL[usuario.perfil]} />
        </Cartao>

        <Cartao titulo="Cadastros">
          <View
            style={styles.itemMenu}
            accessible
            accessibilityLabel="Veterinários: disponível no Ciclo 2"
            accessibilityState={{ disabled: true }}
          >
            <Icone name="medkit-outline" size={24} color={cores.textoSecundario} />
            <Text style={styles.textoItem}>Veterinários</Text>
            <View style={styles.etiqueta}>
              <Text style={styles.textoEtiqueta}>Ciclo 2</Text>
            </View>
          </View>
        </Cartao>

        <CartaoSincronizacao />

        <Botao
          titulo="Sair"
          variante="perigo"
          icone="log-out-outline"
          aoPressionar={confirmarSaida}
          dicaAcessibilidade="Pede confirmação e encerra a sessão neste celular"
        />
      </ScrollView>
    </Tela>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: espacamento.md,
    paddingBottom: espacamento.xl,
  },
  itemMenu: {
    minHeight: TAMANHO_MINIMO_TOQUE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
  },
  textoItem: {
    flex: 1,
    fontSize: fontes.normal,
    color: cores.textoSecundario,
  },
  etiqueta: {
    paddingHorizontal: espacamento.sm,
    paddingVertical: 2,
    borderRadius: raios.redondo,
    backgroundColor: cores.fundoSecundario,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  textoEtiqueta: {
    fontSize: fontes.pequena,
    color: cores.textoSecundario,
    fontWeight: '600',
  },
});
