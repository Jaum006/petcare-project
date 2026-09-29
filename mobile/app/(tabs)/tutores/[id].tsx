import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '@/components/Aviso';
import { BadgeSync } from '@/components/BadgeSync';
import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Carregando';
import { Cartao } from '@/components/Cartao';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Icone } from '@/components/Icone';
import { LinhaInfo } from '@/components/LinhaInfo';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/contexts/AuthContext';
import { useSincronizacao } from '@/contexts/SyncContext';
import { useOnline } from '@/hooks/useOnline';
import { useTutor } from '@/hooks/useTutores';
import { excluirTutor } from '@/services/tutorService';
import { cores, espacamento, fontes, raios } from '@/theme';
import { formatarCep, formatarCpf, formatarDataHora, formatarTelefone } from '@/validation/mascaras';

const NAO_INFORMADO = 'Não informado';

export default function TelaDetalheTutor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const { sincronizar } = useSincronizacao();
  const online = useOnline();
  const { tutor, carregando } = useTutor(id);
  const [excluindo, setExcluindo] = useState(false);

  // RN03: somente a Recepção pode alterar e excluir tutores.
  const podeAlterar = usuario?.perfil === 'RECEPCAO';

  if (carregando) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  if (!tutor) {
    return (
      <Tela>
        <EstadoVazio
          icone="person-remove-outline"
          titulo="Tutor não encontrado"
          mensagem="Ele pode ter sido excluído."
        />
      </Tela>
    );
  }

  async function excluir(idTutor: string) {
    setExcluindo(true);
    try {
      await excluirTutor(idTutor);

      // Sem conexão, a exclusão fica pendente e é enviada quando a conexão voltar
      // (a chamada abaixo só atualiza o contador de pendências).
      if (!online) {
        sincronizar();
        router.back();
        return;
      }

      // Com conexão, sincroniza na hora para saber se a API aceitou (RN02: tutor com pets não pode ser excluído).
      // Se ela recusou, o tutor volta a aparecer, a sincronização mostra o motivo e continuamos nesta tela.
      const resultado = await sincronizar();
      const recusada = resultado?.recusados.some((item) => item.id === idTutor);
      if (!recusada) {
        router.back();
      }
    } finally {
      setExcluindo(false);
    }
  }

  function confirmarExclusao(idTutor: string, nome: string) {
    Alert.alert('Excluir tutor', `Deseja realmente excluir ${nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluir(idTutor) },
    ]);
  }

  const cidadeUf = [tutor.cidade, tutor.uf].filter(Boolean).join(' / ');

  return (
    <Tela>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <View style={styles.avatar}>
            <Icone name="person" size={32} color={cores.primaria} />
          </View>
          <View style={styles.nomeEStatus}>
            <Text style={styles.nome} accessibilityRole="header">
              {tutor.nome}
            </Text>
            <BadgeSync status={tutor.syncStatus} />
          </View>
        </View>

        {tutor.syncStatus === 'erro' && (
          <Aviso
            tipo="erro"
            mensagem={`Erro ao sincronizar: ${tutor.syncErro ?? 'a API recusou a alteração.'}${
              podeAlterar ? ' Edite e salve o cadastro para tentar novamente.' : ''
            }`}
          />
        )}
        {tutor.syncStatus === 'pendente' && (
          <Aviso
            tipo="info"
            mensagem="Este cadastro ainda não foi enviado ao servidor. O envio é automático quando houver conexão."
          />
        )}

        <Cartao titulo="Dados pessoais">
          <LinhaInfo rotulo="CPF" valor={formatarCpf(tutor.cpf)} />
          <LinhaInfo rotulo="Telefone" valor={formatarTelefone(tutor.telefone)} />
          <LinhaInfo rotulo="E-mail" valor={tutor.email ?? NAO_INFORMADO} />
        </Cartao>

        <Cartao titulo="Endereço">
          <LinhaInfo rotulo="CEP" valor={tutor.cep ? formatarCep(tutor.cep) : NAO_INFORMADO} />
          <LinhaInfo rotulo="Logradouro" valor={tutor.logradouro ?? NAO_INFORMADO} />
          <LinhaInfo rotulo="Número" valor={tutor.numero ?? NAO_INFORMADO} />
          <LinhaInfo rotulo="Complemento" valor={tutor.complemento ?? NAO_INFORMADO} />
          <LinhaInfo rotulo="Bairro" valor={tutor.bairro ?? NAO_INFORMADO} />
          <LinhaInfo rotulo="Cidade / UF" valor={cidadeUf || NAO_INFORMADO} />
        </Cartao>

        <Cartao titulo="Registro">
          <LinhaInfo rotulo="Cadastrado em" valor={formatarDataHora(tutor.criadoEm)} />
          <LinhaInfo rotulo="Última alteração" valor={formatarDataHora(tutor.atualizadoEm)} />
        </Cartao>

        {podeAlterar && (
          <View style={styles.acoes}>
            <Botao
              titulo="Editar"
              icone="create-outline"
              aoPressionar={() => router.push({ pathname: '/tutores/editar/[id]', params: { id: tutor.id } })}
              desabilitado={excluindo}
            />
            <Botao
              titulo={excluindo ? 'Excluindo...' : 'Excluir'}
              variante="perigo"
              icone="trash-outline"
              carregando={excluindo}
              aoPressionar={() => confirmarExclusao(tutor.id, tutor.nome)}
              dicaAcessibilidade="Pede confirmação antes de excluir o tutor"
            />
          </View>
        )}
      </ScrollView>
    </Tela>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: espacamento.md,
    paddingBottom: espacamento.xl,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    marginBottom: espacamento.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: raios.redondo,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nomeEStatus: {
    flex: 1,
  },
  nome: {
    fontSize: fontes.grande,
    fontWeight: '700',
    color: cores.texto,
  },
  acoes: {
    gap: espacamento.sm,
  },
});
