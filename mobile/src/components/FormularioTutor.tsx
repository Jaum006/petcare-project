import { useHeaderHeight } from 'expo-router/react-navigation';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFormularioTutor } from '@/hooks/useFormularioTutor';
import type { TutorLocal } from '@/types/tutor';
import { cores, espacamento, fontes } from '@/theme';
import { formatarCep, formatarCpf, formatarTelefone } from '@/validation/mascaras';

import { Aviso } from './Aviso';
import { Botao } from './Botao';
import { CampoTexto } from './CampoTexto';
import { Cartao } from './Cartao';

interface FormularioTutorProps {
  /** Tutor a editar. Sem ele, o formulário cadastra um novo tutor. */
  tutor?: TutorLocal;
  aoSalvar: () => void;
  aoCancelar: () => void;
}

/** Formulário de tutor usado nas telas "Novo tutor" e "Editar tutor". */
export function FormularioTutor({ tutor, aoSalvar, aoCancelar }: FormularioTutorProps) {
  const alturaCabecalho = useHeaderHeight();
  const { valores, erros, erroGeral, salvando, buscandoCep, avisoCep, alterarCampo, buscarCep, salvar } =
    useFormularioTutor(tutor);

  async function aoPressionarSalvar() {
    if (await salvar()) {
      aoSalvar();
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={alturaCabecalho}
    >
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Cartao titulo="Dados pessoais">
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
            rotulo="CPF"
            obrigatorio
            valor={formatarCpf(valores.cpf)}
            aoAlterar={(texto) => alterarCampo('cpf', texto)}
            erro={erros.cpf}
            keyboardType="number-pad"
            placeholder="000.000.000-00"
            maxLength={14}
          />
          <CampoTexto
            rotulo="Telefone"
            obrigatorio
            valor={formatarTelefone(valores.telefone)}
            aoAlterar={(texto) => alterarCampo('telefone', texto)}
            erro={erros.telefone}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
          <CampoTexto
            rotulo="E-mail"
            valor={valores.email}
            aoAlterar={(texto) => alterarCampo('email', texto)}
            erro={erros.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            placeholder="nome@exemplo.com"
          />
        </Cartao>

        <Cartao titulo="Endereço">
          <CampoTexto
            rotulo="CEP"
            valor={formatarCep(valores.cep)}
            aoAlterar={(texto) => alterarCampo('cep', texto)}
            erro={erros.cep}
            keyboardType="number-pad"
            placeholder="00000-000"
            maxLength={9}
            dica="Ao digitar o CEP completo, o endereço é preenchido automaticamente."
            acessorio={
              <Botao
                titulo="Buscar"
                variante="secundario"
                icone="search"
                carregando={buscandoCep}
                aoPressionar={buscarCep}
                rotuloAcessibilidade="Buscar endereço pelo CEP"
              />
            }
          />
          {!!avisoCep && <Aviso tipo="alerta" mensagem={avisoCep} />}
          <CampoTexto
            rotulo="Logradouro"
            valor={valores.logradouro}
            aoAlterar={(texto) => alterarCampo('logradouro', texto)}
            erro={erros.logradouro}
            placeholder="Rua, avenida..."
          />
          <View style={styles.linha}>
            <View style={styles.colunaMenor}>
              <CampoTexto
                rotulo="Número"
                valor={valores.numero}
                aoAlterar={(texto) => alterarCampo('numero', texto)}
                erro={erros.numero}
              />
            </View>
            <View style={styles.colunaMaior}>
              <CampoTexto
                rotulo="Complemento"
                valor={valores.complemento}
                aoAlterar={(texto) => alterarCampo('complemento', texto)}
                erro={erros.complemento}
              />
            </View>
          </View>
          <CampoTexto
            rotulo="Bairro"
            valor={valores.bairro}
            aoAlterar={(texto) => alterarCampo('bairro', texto)}
            erro={erros.bairro}
          />
          <View style={styles.linha}>
            <View style={styles.colunaMaior}>
              <CampoTexto
                rotulo="Cidade"
                valor={valores.cidade}
                aoAlterar={(texto) => alterarCampo('cidade', texto)}
                erro={erros.cidade}
              />
            </View>
            <View style={styles.colunaMenor}>
              <CampoTexto
                rotulo="UF"
                valor={valores.uf}
                aoAlterar={(texto) => alterarCampo('uf', texto)}
                erro={erros.uf}
                autoCapitalize="characters"
                maxLength={2}
                placeholder="GO"
              />
            </View>
          </View>
        </Cartao>

        <Text style={styles.legenda}>* Campos obrigatórios</Text>
        {!!erroGeral && <Aviso tipo="erro" mensagem={erroGeral} />}

        <View style={styles.acoes}>
          <Botao
            titulo="Salvar"
            icone="checkmark"
            carregando={salvando}
            aoPressionar={aoPressionarSalvar}
            dicaAcessibilidade="Grava o tutor no celular e envia para o servidor quando houver conexão"
          />
          <Botao titulo="Cancelar" variante="secundario" aoPressionar={aoCancelar} desabilitado={salvando} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  conteudo: {
    padding: espacamento.md,
    paddingBottom: espacamento.xl,
  },
  linha: {
    flexDirection: 'row',
    gap: espacamento.sm,
  },
  colunaMenor: {
    flex: 1,
  },
  colunaMaior: {
    flex: 2,
  },
  legenda: {
    fontSize: fontes.pequena,
    color: cores.textoSecundario,
    marginBottom: espacamento.md,
  },
  acoes: {
    gap: espacamento.sm,
  },
});
