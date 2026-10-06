# PetCare

Aplicativo móvel de gestão para pet shops e clínicas veterinárias de pequeno e médio porte: cadastro de tutores e pets, agenda de consultas, histórico de atendimentos e visão geral do dia. Projeto Integrador — ADS PUC Goiás, 2026/2.

Protótipo navegável (Figma): https://rating-poppy-06170524.figma.site/

## Arquitetura

MVC com front-end e API separados:

| Camada | Onde | Tecnologia |
|---|---|---|
| View | [`mobile/`](mobile/) — aplicativo | React Native + Expo + TypeScript, SQLite local (funciona offline) |
| Controller + Model | [`api/`](api/) — API REST | Node.js + Express + Prisma + Zod, JWT |
| Banco | `api/prisma` | SQLite (desenvolvimento) · PostgreSQL (produção) |

Modelo de dados, regras de negócio, contrato da API e sincronização: [`docs/especificacao-tecnica.md`](docs/especificacao-tecnica.md).

## Como rodar

Pré-requisitos: Node.js 20+ no computador e o app **Expo Go** no celular (Android). Computador e celular na mesma rede Wi-Fi.

1. **API** — veja [`api/README.md`](api/README.md):
   ```bash
   cd api
   npm install
   cp .env.example .env
   npm run db:migrate
   npm run dev
   ```
2. **App** — veja [`mobile/README.md`](mobile/README.md):
   ```bash
   cd mobile
   npm install
   cp .env.example .env      # coloque o endereço "Na rede local" mostrado pela API
   npx expo start
   ```
   Escaneie o QR code com o Expo Go.

### Credenciais de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Recepção | recepcao@petcare.com | `petcare123` (definida em `SEED_SENHA_PADRAO`) |
| Veterinário | veterinario@petcare.com | `petcare123` |

## Estado atual (Ciclo 1 — N1)

- [x] Estrutura em camadas (API e app)
- [x] Autenticação com cadastro, login e 2 perfis (Recepção e Veterinário)
- [x] Módulo de Tutores: incluir, consultar, alterar, excluir, busca
- [x] Persistência local (SQLite) com funcionamento offline e sincronização com a API
- [x] Consulta de CEP (ViaCEP)
- [x] Regras RN01 (CPF válido e único), RN02 (tutor com pets não é excluído — na API) e RN03 (permissões por perfil)
- [ ] Pets com foto (câmera), Veterinários — Ciclo 2
- [ ] Consultas, histórico de atendimentos, dashboard completo — Ciclo 3
- [ ] Testes com usuários, APK, API publicada com PostgreSQL — Ciclo 4

## Fluxo de trabalho da equipe

- `main` sempre estável; cada funcionalidade em um branch próprio: `feature/pets`, `fix/validacao-cpf`...
- Integração por **pull request revisado por outro integrante**.
- Mensagens de commit descritivas, no padrão `tipo: descrição` — ex.: `feat: cadastro de pets com foto`, `fix: corrige máscara de telefone`, `docs: atualiza README da API`.
- Nunca versionar `.env`; use os arquivos `.env.example`.
