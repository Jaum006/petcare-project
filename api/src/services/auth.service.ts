import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { usuarioModel, type Usuario } from '../models/usuario.model';
import { ErroAplicacao } from '../utils/erros';
import type { DadosCadastro, DadosLogin, Perfil } from '../validators/auth.validator';

const RODADAS_BCRYPT = 10;

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface Sessao {
  token: string;
  usuario: UsuarioPublico;
}

export interface ConteudoToken {
  sub: string;
  nome: string;
  perfil: Perfil;
}

function paraUsuarioPublico(usuario: Usuario): UsuarioPublico {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil as Perfil };
}

function gerarToken(usuario: UsuarioPublico): string {
  const opcoes: SignOptions = {
    subject: usuario.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ nome: usuario.nome, perfil: usuario.perfil }, env.JWT_SECRET, opcoes);
}

export const authService = {
  async cadastrar(dados: DadosCadastro): Promise<Sessao> {
    const existente = await usuarioModel.buscarPorEmail(dados.email);
    if (existente) {
      throw new ErroAplicacao(409, 'EMAIL_DUPLICADO', 'Já existe um usuário com este e-mail.');
    }

    const senhaHash = await bcrypt.hash(dados.senha, RODADAS_BCRYPT);
    const usuario = paraUsuarioPublico(
      await usuarioModel.criar({ nome: dados.nome, email: dados.email, senhaHash, perfil: dados.perfil }),
    );
    return { token: gerarToken(usuario), usuario };
  },

  async entrar(dados: DadosLogin): Promise<Sessao> {
    const registro = await usuarioModel.buscarPorEmail(dados.email);
    const senhaConfere = registro ? await bcrypt.compare(dados.senha, registro.senhaHash) : false;

    // Mesma mensagem para e-mail inexistente e senha errada, para não revelar quais e-mails existem.
    if (!registro || !senhaConfere) {
      throw new ErroAplicacao(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos.');
    }

    const usuario = paraUsuarioPublico(registro);
    return { token: gerarToken(usuario), usuario };
  },

  async obterUsuario(id: string): Promise<UsuarioPublico> {
    const usuario = await usuarioModel.buscarPorId(id);
    if (!usuario) {
      throw new ErroAplicacao(401, 'NAO_AUTENTICADO', 'Usuário da sessão não existe mais.');
    }
    return paraUsuarioPublico(usuario);
  },

  verificarToken(token: string): ConteudoToken {
    const conteudo = jwt.verify(token, env.JWT_SECRET);
    if (typeof conteudo === 'string' || !conteudo.sub) {
      throw new ErroAplicacao(401, 'NAO_AUTENTICADO', 'Sessão inválida. Entre novamente.');
    }
    return { sub: conteudo.sub, nome: conteudo.nome, perfil: conteudo.perfil };
  },
};
