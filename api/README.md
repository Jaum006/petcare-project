# PetCare — API

API REST do PetCare. No MVC do projeto, ela corresponde às camadas **Controller** e **Model**; a View é o app em `../mobile`.

Tecnologias: Node.js 20+, TypeScript, Express 5, Prisma (SQLite em desenvolvimento), Zod, JWT e bcrypt.

## Como rodar

```bash
cd api
npm install
cp .env.example .env        # depois edite o .env e troque o JWT_SECRET
npm run db:migrate          # cria o banco SQLite e roda o seed
npm run dev                 # sobe a API em modo de desenvolvimento (porta 3333)
```

Para gerar um `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Ao iniciar, a API mostra os endereços em que está acessível. Use o endereço **"Na rede local"** no `EXPO_PUBLIC_API_URL` do app (o celular precisa estar no mesmo Wi-Fi do computador).

### Usuários de teste (criados pelo seed)

| Perfil | E-mail | Senha |
|---|---|---|
| Recepção | recepcao@petcare.com | valor de `SEED_SENHA_PADRAO` no `.env` |
| Veterinário | veterinario@petcare.com | valor de `SEED_SENHA_PADRAO` no `.env` |

O seed também cria 3 tutores, 2 veterinários e 3 pets. A tutora **Ana Paula Martins** tem pets vinculados, o que serve para demonstrar a regra RN02 (não é possível excluí-la).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | API com recarga automática |
| `npm run build` / `npm start` | compila para `dist/` e executa a versão compilada |
| `npm run typecheck` | verifica os tipos sem gerar arquivos |
| `npm test` | testes automatizados (Vitest) |
| `npm run db:migrate` | aplica/gera migrations a partir do `prisma/schema.prisma` |
| `npm run db:seed` | recria os dados de teste |
| `npm run db:reset` | apaga o banco, reaplica as migrations e roda o seed |

## Estrutura (MVC)

```
prisma/
  schema.prisma     modelagem de dados (fonte das migrations)
  migrations/       histórico versionado das alterações no banco
  seed.ts           dados de teste
src/
  server.ts         inicia o servidor HTTP
  app.ts            configura o Express (middlewares e rotas)
  config/env.ts     lê e valida as variáveis de ambiente
  routes/           URL → controller (e quais perfis podem acessar)
  controllers/      lê a requisição, valida a entrada, chama o service e responde
  services/         regras de negócio (RN01, RN02, ...)
  models/           acesso ao banco via Prisma
  validators/       esquemas Zod de entrada
  middlewares/      autenticação/autorização, tratamento de erros, log
  utils/            validação de CPF e erro padrão da aplicação
```

Fluxo de uma requisição: `routes` → `middlewares/autenticacao` → `controllers` → `services` → `models` → banco.

## Endpoints

Documentação completa do contrato em [`../docs/especificacao-tecnica.md`](../docs/especificacao-tecnica.md).

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/health` | público |
| POST | `/api/auth/cadastro` | público |
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | autenticado |
| GET | `/api/tutores?busca=` · `?atualizadosDesde=` | autenticado |
| GET | `/api/tutores/:id` | autenticado |
| POST | `/api/tutores` | Recepção |
| PUT | `/api/tutores/:id` (upsert) | Recepção |
| DELETE | `/api/tutores/:id` | Recepção |

## Trocando para PostgreSQL

1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
2. No `.env`, use `DATABASE_URL="postgresql://usuario:senha@host:5432/petcare"`.
3. Apague a pasta `prisma/migrations` (as migrations do SQLite não servem para o PostgreSQL) e rode `npm run db:migrate`.
