import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { Carregando } from '@/components/Carregando';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Icone } from '@/components/Icone';
import { ItemTutor } from '@/components/ItemTutor';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/contexts/AuthContext';
import { useSincronizacao } from '@/contexts/SyncContext';
import { useListaTutores } from '@/hooks/useTutores';
import { cores, espacamento, fontes, raios, TAMANHO_MINIMO_TOQUE } from '@/theme';

function Separador() {
  return <View style={styles.separador} />;
}

export default function TelaListaTutores() {
  const { usuario } = useAuth();
  const { sincronizar } = useSincronizacao();
  const [busca, setBusca] = useState('');
  const [atualizando, setAtualizando] = useState(false);
  const { tutores, carregando } = useListaTutores(busca);

  // RN03: somente a Recepção pode cadastrar tutores.
  const podeCadastrar = usuario?.perfil === 'RECEPCAO';

  async function aoPuxarParaAtualizar() {
    setAtualizando(true);
    await sincronizar();
    setAtualizando(false);
  }

  function renderizarVazio() {
    if (carregando) {
      return <Carregando mensagem="Carregando tutores..." />;
    }
    if (busca.trim()) {
      return (
        <EstadoVazio
          icone="search-outline"
          titulo="Nenhum tutor encontrado para a busca"
          mensagem="Confira o nome, CPF ou e-mail digitado."
        />
      );
    }
    return (
      <EstadoVazio
        icone="people-outline"
        titulo="Nenhum tutor cadastrado"
        mensagem={
          podeCadastrar
            ? 'Toque em "Novo tutor" para cadastrar o primeiro.'
            : 'Os tutores cadastrados pela recepção aparecerão aqui.'
        }
      />
    );
  }

  return (
    <Tela>
      <View style={styles.busca}>
        <Icone name="search" size={20} color={cores.textoSuave} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome, CPF ou e-mail"
          placeholderTextColor={cores.textoSuave}
          accessibilityLabel="Buscar tutor por nome, CPF ou e-mail"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.campoBusca}
        />
        {busca.length > 0 && (
          <Pressable
            onPress={() => setBusca('')}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            hitSlop={8}
            style={styles.limparBusca}
          >
            <Icone name="close-circle" size={22} color={cores.textoSuave} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={tutores}
        keyExtractor={(tutor) => tutor.id}
        renderItem={({ item }) => (
          <ItemTutor
            tutor={item}
            aoPressionar={() => router.push({ pathname: '/tutores/[id]', params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={Separador}
        ListEmptyComponent={renderizarVazio()}
        contentContainerStyle={[styles.lista, podeCadastrar && styles.listaComBotao]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoPuxarParaAtualizar}
            colors={[cores.primaria]}
            tintColor={cores.primaria}
          />
        }
      />

      {podeCadastrar && (
        <Pressable
          onPress={() => router.push('/tutores/novo')}
          accessibilityRole="button"
          accessibilityLabel="Novo tutor"
          accessibilityHint="Abre o formulário de cadastro de tutor"
          style={({ pressed }) => [styles.botaoNovo, pressed && styles.botaoNovoPressionado]}
        >
          <Icone name="add" size={24} color={cores.branco} />
          <Text style={styles.textoBotaoNovo}>Novo tutor</Text>
        </Pressable>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
    margin: espacamento.md,
    marginBottom: espacamento.sm,
    paddingHorizontal: espacamento.md,
    minHeight: TAMANHO_MINIMO_TOQUE,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    borderRadius: raios.md,
  },
  campoBusca: {
    flex: 1,
    minHeight: TAMANHO_MINIMO_TOQUE,
    fontSize: fontes.normal,
    color: cores.texto,
  },
  limparBusca: {
    minWidth: TAMANHO_MINIMO_TOQUE,
    minHeight: TAMANHO_MINIMO_TOQUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: {
    flexGrow: 1,
    padding: espacamento.md,
    paddingTop: espacamento.sm,
  },
  listaComBotao: {
    paddingBottom: 96,
  },
  separador: {
    height: espacamento.sm,
  },
  botaoNovo: {
    position: 'absolute',
    right: espacamento.md,
    bottom: espacamento.md,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
    paddingHorizontal: espacamento.lg,
    borderRadius: raios.redondo,
    backgroundColor: cores.primaria,
    elevation: 4,
    shadowColor: cores.texto,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  botaoNovoPressionado: {
    backgroundColor: cores.primariaEscura,
  },
  textoBotaoNovo: {
    color: cores.branco,
    fontSize: fontes.normal,
    fontWeight: '700',
  },
});
