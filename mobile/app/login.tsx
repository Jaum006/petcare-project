import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { Icone } from '@/components/Icone';
import { useAuth } from '@/contexts/AuthContext';
import { useOnline } from '@/hooks/useOnline';
import { mensagemDeErro } from '@/services/api';
import { cores, espacamento, fontes, raios } from '@/theme';
import { loginSchema, type FormularioLogin } from '@/validation/authSchemas';
import { errosPorCampo, type ErrosDeCampo } from '@/validation/erros';

export default function TelaLogin() {
  const { entrar, aviso } = useAuth();
  const online = useOnline();
  const [valores, setValores] = useState<FormularioLogin>({ email: '', senha: '' });
  const [erros, setErros] = useState<ErrosDeCampo>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function alterarCampo(campo: keyof FormularioLogin, texto: string) {
    setValores((atuais) => ({ ...atuais, [campo]: texto }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
    setErroGeral(null);
  }

  async function aoPressionarEntrar() {
    const validacao = loginSchema.safeParse(valores);
    if (!validacao.success) {
      setErros(errosPorCampo(validacao.error));
      return;
    }
    if (!online) {
      setErroGeral('Você está sem conexão. Conecte-se à internet para entrar.');
      return;
    }

    setEnviando(true);
    try {
      // Se der certo, o layout raiz troca para as abas automaticamente.
      await entrar(validacao.data.email, validacao.data.senha);
    } catch (erro) {
      setErroGeral(mensagemDeErro(erro));
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <View style={styles.marca}>
            <View style={styles.logo}>
              <Icone name="paw" size={48} color={cores.branco} />
            </View>
            <Text style={styles.titulo} accessibilityRole="header">
              PetCare
            </Text>
            <Text style={styles.subtitulo}>Gestão para pet shops e clínicas veterinárias</Text>
          </View>

          {!online && (
            <Aviso tipo="alerta" mensagem="Você está sem conexão. É preciso internet para entrar." />
          )}
          {!!aviso && <Aviso tipo="info" mensagem={aviso} />}

          <CampoTexto
            rotulo="E-mail"
            valor={valores.email}
            aoAlterar={(texto) => alterarCampo('email', texto)}
            erro={erros.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            textContentType="emailAddress"
            placeholder="nome@exemplo.com"
          />
          <CampoTexto
            rotulo="Senha"
            valor={valores.senha}
            aoAlterar={(texto) => alterarCampo('senha', texto)}
            erro={erros.senha}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={aoPressionarEntrar}
          />

          {!!erroGeral && <Aviso tipo="erro" mensagem={erroGeral} />}

          <Botao
            titulo={enviando ? 'Entrando...' : 'Entrar'}
            icone="log-in-outline"
            carregando={enviando}
            aoPressionar={aoPressionarEntrar}
          />

          <View style={styles.rodape}>
            <Text style={styles.textoRodape}>Ainda não tem conta?</Text>
            <Botao
              titulo="Criar conta"
              variante="secundario"
              icone="person-add-outline"
              aoPressionar={() => router.push('/cadastro')}
              dicaAcessibilidade="Abre o formulário de cadastro de usuário"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espacamento.lg,
  },
  marca: {
    alignItems: 'center',
    marginBottom: espacamento.xl,
    gap: espacamento.sm,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: raios.redondo,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: fontes.titulo,
    fontWeight: '800',
    color: cores.primaria,
  },
  subtitulo: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
  rodape: {
    marginTop: espacamento.xl,
    gap: espacamento.sm,
  },
  textoRodape: {
    textAlign: 'center',
    fontSize: fontes.normal,
    color: cores.textoSecundario,
  },
});
