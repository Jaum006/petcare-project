import { useHeaderHeight } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { SeletorPerfil } from '@/components/SeletorPerfil';
import { useAuth } from '@/contexts/AuthContext';
import { useOnline } from '@/hooks/useOnline';
import { ApiError, mensagemDeErro } from '@/services/api';
import type { Perfil } from '@/types/usuario';
import { cores, espacamento, fontes } from '@/theme';
import { cadastroSchema, type FormularioCadastro } from '@/validation/authSchemas';
import { errosDosDetalhesDaApi, errosPorCampo, type ErrosDeCampo } from '@/validation/erros';

/** No formulário o perfil começa sem seleção (""). */
type ValoresCadastro = Omit<FormularioCadastro, 'perfil'> & { perfil: Perfil | '' };
type CampoCadastro = keyof ValoresCadastro;

const VALORES_INICIAIS: ValoresCadastro = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  perfil: '',
};

export default function TelaCadastro() {
  const { cadastrar } = useAuth();
  const online = useOnline();
  const alturaCabecalho = useHeaderHeight();
  const [valores, setValores] = useState<ValoresCadastro>(VALORES_INICIAIS);
  const [erros, setErros] = useState<ErrosDeCampo>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function alterarCampo(campo: CampoCadastro, texto: string) {
    setValores((atuais) => ({ ...atuais, [campo]: texto }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
    setErroGeral(null);
  }

  async function aoPressionarCadastrar() {
    const validacao = cadastroSchema.safeParse(valores);
    if (!validacao.success) {
      setErros(errosPorCampo(validacao.error));
      setErroGeral('Corrija os campos destacados.');
      return;
    }
    if (!online) {
      setErroGeral('Você está sem conexão. Conecte-se à internet para criar a conta.');
      return;
    }

    const { nome, email, senha, perfil } = validacao.data;
    setEnviando(true);
    try {
      // Se der certo, o usuário já fica logado e o layout raiz abre as abas.
      await cadastrar({ nome, email, senha, perfil });
    } catch (erro) {
      if (erro instanceof ApiError && erro.codigo === 'EMAIL_DUPLICADO') {
        setErros({ email: erro.mensagem });
      } else if (erro instanceof ApiError && erro.codigo === 'VALIDACAO') {
        setErros(errosDosDetalhesDaApi(erro.detalhes));
      }
      setErroGeral(mensagemDeErro(erro));
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={alturaCabecalho}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.introducao}>Preencha seus dados para acessar o PetCare.</Text>

        {!online && (
          <Aviso tipo="alerta" mensagem="Você está sem conexão. É preciso internet para criar a conta." />
        )}

        <CampoTexto
          rotulo="Nome"
          obrigatorio
          valor={valores.nome}
          aoAlterar={(texto) => alterarCampo('nome', texto)}
          erro={erros.nome}
          autoCapitalize="words"
          autoComplete="name"
          maxLength={100}
        />
        <CampoTexto
          rotulo="E-mail"
          obrigatorio
          valor={valores.email}
          aoAlterar={(texto) => alterarCampo('email', texto)}
          erro={erros.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          placeholder="nome@exemplo.com"
        />
        <CampoTexto
          rotulo="Senha"
          obrigatorio
          valor={valores.senha}
          aoAlterar={(texto) => alterarCampo('senha', texto)}
          erro={erros.senha}
          dica="Mínimo de 6 caracteres."
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <CampoTexto
          rotulo="Confirmar senha"
          obrigatorio
          valor={valores.confirmarSenha}
          aoAlterar={(texto) => alterarCampo('confirmarSenha', texto)}
          erro={erros.confirmarSenha}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <SeletorPerfil
          valor={valores.perfil}
          aoAlterar={(perfil) => alterarCampo('perfil', perfil)}
          erro={erros.perfil}
        />

        {!!erroGeral && <Aviso tipo="erro" mensagem={erroGeral} />}

        <Botao
          titulo={enviando ? 'Criando conta...' : 'Criar conta'}
          icone="person-add-outline"
          carregando={enviando}
          aoPressionar={aoPressionarCadastrar}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    padding: espacamento.lg,
    paddingBottom: espacamento.xl,
  },
  introducao: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    marginBottom: espacamento.lg,
  },
});
