import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NOMES_PERFIL, type Perfil } from '@/types/usuario';
import { cores, espacamento, fontes, raios, TAMANHO_MINIMO_TOQUE } from '@/theme';

import { Icone, type NomeIcone } from './Icone';

const OPCOES: { perfil: Perfil; icone: NomeIcone; descricao: string }[] = [
  { perfil: 'RECEPCAO', icone: 'desktop-outline', descricao: 'Cadastra tutores, pets e consultas' },
  { perfil: 'VETERINARIO', icone: 'medkit-outline', descricao: 'Consulta cadastros e registra atendimentos' },
];

interface SeletorPerfilProps {
  valor: Perfil | '';
  aoAlterar: (perfil: Perfil) => void;
  erro?: string;
}

/** Dois botões grandes para escolher o perfil; funcionam como botões de opção (radio). */
export function SeletorPerfil({ valor, aoAlterar, erro }: SeletorPerfilProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>
        Perfil<Text style={styles.asterisco}> *</Text>
      </Text>
      <View style={styles.opcoes} accessibilityRole="radiogroup" accessibilityLabel="Perfil do usuário">
        {OPCOES.map((opcao) => {
          const selecionado = opcao.perfil === valor;
          const corConteudo = selecionado ? cores.branco : cores.primaria;
          return (
            <Pressable
              key={opcao.perfil}
              onPress={() => aoAlterar(opcao.perfil)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selecionado }}
              accessibilityLabel={`${NOMES_PERFIL[opcao.perfil]}. ${opcao.descricao}`}
              style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
            >
              <Icone
                name={selecionado ? 'checkmark-circle' : opcao.icone}
                size={30}
                color={corConteudo}
              />
              <Text style={[styles.nome, { color: selecionado ? cores.branco : cores.texto }]}>
                {NOMES_PERFIL[opcao.perfil]}
              </Text>
              <Text style={[styles.descricao, { color: selecionado ? cores.branco : cores.textoSecundario }]}>
                {opcao.descricao}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!!erro && (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
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
  opcoes: {
    flexDirection: 'row',
    gap: espacamento.sm,
  },
  opcao: {
    flex: 1,
    minHeight: TAMANHO_MINIMO_TOQUE * 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.xs,
    padding: espacamento.md,
    borderRadius: raios.md,
    borderWidth: 2,
    borderColor: cores.primaria,
    backgroundColor: cores.branco,
  },
  opcaoSelecionada: {
    backgroundColor: cores.primaria,
  },
  nome: {
    fontSize: fontes.normal,
    fontWeight: '700',
  },
  descricao: {
    fontSize: fontes.pequena,
    textAlign: 'center',
  },
  erro: {
    marginTop: espacamento.xs,
    color: cores.perigoTexto,
    fontSize: fontes.pequena,
    fontWeight: '600',
  },
});
