# PetCare — Especificação técnica

Documento de referência da equipe. Tudo o que o app (`mobile/`), a API (`api/`) e o documento de projeto disserem sobre dados, regras e endpoints deve bater com este arquivo. Se algo mudar, atualize aqui primeiro.

## 1. Visão geral

| Item | Decisão |
|---|---|
| Arquitetura | MVC com front-end e API separados. **View** = app mobile; **Controller** e **Model** = API REST. Regras de negócio ficam em *services* (camada de serviço do Model). |
| App (View) | React Native + Expo + TypeScript, Expo Router (navegação), expo-sqlite (persistência local), expo-secure-store (sessão), NetInfo (conectividade) |
| API | Node.js + TypeScript + Express + Prisma + Zod, autenticação JWT, senhas com bcrypt |
| Banco da API | SQLite em desenvolvimento; PostgreSQL no ambiente publicado (troca via `provider`/`DATABASE_URL` do Prisma) |
| Integração externa (R7) | ViaCEP — preenchimento automático de endereço do tutor pelo CEP |
| Recurso nativo (R8) | Câmera/galeria para foto do pet (expo-image-picker) — Ciclo 2 |
| Offline (R5/R6) | O app grava primeiro no SQLite local (offline-first) e sincroniza com a API quando há conexão |

## 2. Perfis de usuário (R2)

| Perfil | Código | Pode |
|---|---|---|
| Recepção | `RECEPCAO` | Cadastrar, editar e excluir tutores, pets e veterinários; agendar e cancelar consultas |
| Veterinário | `VETERINARIO` | Consultar tutores e pets (somente leitura); ver sua agenda; registrar o atendimento (marcar consulta como realizada) |

## 3. Modelo de dados

Os ids são UUID. Nas entidades sincronizáveis (Tutor, Pet, Veterinario, Consulta) o id é gerado no app, o que permite criar registros offline sem conflito; se um `POST` chegar sem id, a API gera um. O id do Usuario é gerado pela API no cadastro. Toda entidade sincronizável tem `criadoEm`, `atualizadoEm` e `excluidoEm` (exclusão lógica, necessária para propagar exclusões na sincronização).

### Usuario
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| nome | texto | obrigatório, 3–100 caracteres |
| email | texto | obrigatório, formato de e-mail, **único** |
| senhaHash | texto | bcrypt; senha com no mínimo 6 caracteres |
| perfil | `RECEPCAO` \| `VETERINARIO` | obrigatório |
| criadoEm, atualizadoEm | data/hora | |

### Tutor
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| nome | texto | obrigatório, 3–100 caracteres |
| cpf | texto (11 dígitos) | obrigatório, **válido (dígitos verificadores)** e **único** entre tutores não excluídos |
| telefone | texto (10–11 dígitos) | obrigatório |
| email | texto | opcional, formato de e-mail |
| cep | texto (8 dígitos) | opcional |
| logradouro, numero, complemento, bairro, cidade | texto | opcionais |
| uf | texto (2 letras) | opcional |
| criadoEm, atualizadoEm, excluidoEm | data/hora | |

### Pet (Ciclo 2)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| tutorId | UUID | FK → Tutor, **obrigatório** |
| nome | texto | obrigatório |
| especie | `CAO` \| `GATO` \| `OUTRO` | obrigatório |
| raca | texto | opcional |
| sexo | `M` \| `F` | obrigatório |
| dataNascimento | data | opcional, **não pode ser futura** |
| peso | decimal (kg) | opcional, > 0 |
| fotoUri | texto | opcional (foto tirada com a câmera) |
| observacoes | texto | opcional |
| criadoEm, atualizadoEm, excluidoEm | data/hora | |

### Veterinario (Ciclo 2)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| usuarioId | UUID | FK → Usuario, opcional, único (liga o profissional ao seu login) |
| nome | texto | obrigatório |
| crmv | texto | obrigatório, **único** entre veterinários não excluídos (verificado no serviço, como o CPF) |
| especialidade | texto | opcional |
| telefone, email | texto | opcionais |
| ativo | booleano | padrão verdadeiro |
| criadoEm, atualizadoEm, excluidoEm | data/hora | |

### Consulta (Ciclo 3) — também forma o histórico de atendimentos do pet
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID | PK |
| petId | UUID | FK → Pet, obrigatório |
| veterinarioId | UUID | FK → Veterinario, obrigatório |
| dataHora | data/hora | obrigatório, futura no agendamento |
| duracaoMinutos | inteiro | padrão 30 |
| motivo | texto | obrigatório |
| status | `AGENDADA` \| `REALIZADA` \| `CANCELADA` | padrão `AGENDADA` |
| diagnostico, tratamento | texto | obrigatórios ao marcar como `REALIZADA` |
| motivoCancelamento | texto | obrigatório ao marcar como `CANCELADA` |
| criadoPorId | UUID | FK → Usuario |
| criadoEm, atualizadoEm, excluidoEm | data/hora | |

### Relacionamentos
- Tutor 1 — N Pet
- Pet 1 — N Consulta
- Veterinario 1 — N Consulta
- Usuario 0..1 — 0..1 Veterinario (um profissional pode ser cadastrado antes de ter login)
- Usuario 1 — N Consulta (quem agendou)

## 4. Regras de negócio (R4)

| Código | Regra | Onde é verificada | Ciclo |
|---|---|---|---|
| RN01 | O CPF do tutor deve ser válido (dígitos verificadores) e não pode estar cadastrado para outro tutor. | App (validação) e API (`TutorService`) | 1 |
| RN02 | Um tutor com pets vinculados não pode ser excluído. | API (`TutorService`) e app | 1 (API) / 2 (app) |
| RN03 | Apenas o perfil Recepção pode incluir, alterar e excluir tutores, pets e veterinários. | API (middleware de autorização) e app (oculta ações) | 1 |
| RN04 | Todo pet deve estar vinculado a um tutor ativo; a data de nascimento não pode ser futura. | App e API | 2 |
| RN05 | Um veterinário não pode ter duas consultas `AGENDADA` com horários sobrepostos (considerando a duração). | API (`ConsultaService`) | 3 |
| RN06 | Consultas só podem ser agendadas para data/hora futura, de segunda a sábado, entre 08h e 18h; o término (início + duração) também deve ocorrer até 18h. | App e API | 3 |
| RN07 | Transições de status permitidas: `AGENDADA → REALIZADA` e `AGENDADA → CANCELADA`. `REALIZADA` e `CANCELADA` são finais. Cancelar exige motivo; realizar exige diagnóstico e tratamento. | API (`ConsultaService`) | 3 |
| RN08 | Somente o veterinário responsável pela consulta pode marcá-la como realizada. | API | 3 |

## 5. Contrato da API REST

Base: `/api`. JSON em todas as requisições e respostas. Rotas, exceto `/api/health`, `/api/auth/cadastro` e `/api/auth/login`, exigem `Authorization: Bearer <token>`.

### Formato de erro
```json
{ "erro": { "codigo": "CPF_DUPLICADO", "mensagem": "Já existe um tutor cadastrado com este CPF.", "detalhes": [] } }
```

| HTTP | Códigos |
|---|---|
| 400 | `VALIDACAO` (com `detalhes: [{ campo, mensagem }]`) |
| 401 | `NAO_AUTENTICADO`, `CREDENCIAIS_INVALIDAS` |
| 403 | `SEM_PERMISSAO` |
| 404 | `NAO_ENCONTRADO` |
| 409 | `EMAIL_DUPLICADO`, `CPF_DUPLICADO`, `ID_DUPLICADO` (POST com id já existente), `TUTOR_COM_PETS` |
| 500 | `ERRO_INTERNO` |

### Saúde
- `GET /api/health` → `200 { "status": "ok" }`

### Autenticação
- `POST /api/auth/cadastro` — body `{ nome, email, senha, perfil }` → `201 { token, usuario }`
- `POST /api/auth/login` — body `{ email, senha }` → `200 { token, usuario }`
- `GET /api/auth/me` → `200 { usuario }`

`usuario` = `{ id, nome, email, perfil }`. O token JWT expira em 8 horas. Sem conexão, o app continua usando a sessão salva; quando volta a falar com a API e recebe `401`, pede novo login — os registros pendentes continuam no SQLite e são enviados depois.

> Limitação conhecida (Ciclo 1): o cadastro é público e o próprio usuário escolhe o perfil. Evolução prevista: somente a Recepção cadastra novos veterinários, e o cadastro de veterinário exige CRMV.

### Tutores
- `GET /api/tutores?busca=texto` → `200 { dados: Tutor[], servidorEm }` — lista tutores ativos, ordenados por nome; `busca` filtra por nome, CPF ou e-mail.
- `GET /api/tutores?atualizadosDesde=ISO` → `200 { dados: Tutor[], servidorEm }` — usado na sincronização: todos os tutores alterados depois da data, **incluindo excluídos** (com `excluidoEm` preenchido).
- `GET /api/tutores/:id` → `200 Tutor` (inclui `totalPets`)
- `POST /api/tutores` — body Tutor sem timestamps (`id` opcional) → `201 Tutor` · somente `RECEPCAO`
- `PUT /api/tutores/:id` — body Tutor → cria ou atualiza (**upsert idempotente**, usado pela sincronização) → `201` (criado) ou `200` (atualizado) · somente `RECEPCAO`. Se o tutor tinha sido excluído no servidor, o PUT o reativa (a última gravação prevalece).
- `DELETE /api/tutores/:id` → `204` · somente `RECEPCAO` · `409 TUTOR_COM_PETS` se houver pets

`Tutor` = `{ id, nome, cpf, telefone, email, cep, logradouro, numero, complemento, bairro, cidade, uf, criadoEm, atualizadoEm, excluidoEm }`. CPF, telefone e CEP trafegam **só com dígitos**; a máscara é responsabilidade do app.

## 6. Sincronização (app ↔ API)

1. Toda gravação no app vai primeiro para o SQLite local, com `sync_status = 'pendente'` e `sync_operacao = 'upsert'` ou `'delete'`.
2. Quando há conexão (ao abrir o app, ao voltar a conexão, ao puxar a lista para atualizar, após cada gravação e no botão "Sincronizar agora"):
   1. **Envio**: para cada registro pendente, `PUT /api/tutores/:id` (upsert) ou `DELETE /api/tutores/:id`. Sucesso → `sincronizado` (exclusão: remove localmente; `404` na exclusão também conta como sucesso). Erro de regra (4xx, exceto 401 e 403) → `sync_status = 'erro'` e `sync_erro` com a mensagem da API, exibida na tela. `403` (perfil sem permissão, ex.: veterinário usando o aparelho) → o envio para e tudo continua pendente até alguém da Recepção entrar. `5xx` → o registro continua pendente e os demais seguem. Erro de rede ou `401` → a sincronização para e tudo continua pendente. O app usa apenas `PUT` (upsert) para incluir e alterar; o `POST` fica disponível para outros clientes.
   2. **Recebimento**: `GET /api/tutores?atualizadosDesde=<ultimaSincronizacao>`; aplica no SQLite os registros que não estão pendentes localmente (excluídos no servidor são removidos). Guarda `servidorEm` como nova `ultimaSincronizacao`.
3. Registros em `erro` não são reenviados automaticamente nem sobrescritos pelo servidor; voltam a `pendente` quando o usuário corrige e salva de novo. Se a exclusão for recusada (ex.: `TUTOR_COM_PETS`), o registro volta a aparecer como `sincronizado` (igual ao servidor) e o app mostra um alerta com o motivo.
4. Conflitos: vale a última gravação enviada (*last write wins*). Limitação documentada.
5. Sem conexão, o app funciona normalmente com os dados locais e mostra um aviso "Você está offline — as alterações serão enviadas quando a conexão voltar".

## 7. Estrutura de pastas

```
petcare/
  docs/                 especificação, documento de projeto
  api/
    prisma/             schema.prisma (modelagem), migrations, seed
    src/
      config/           variáveis de ambiente
      models/           acesso a dados (Prisma)
      services/         regras de negócio
      controllers/      recebem requisições e devolvem respostas
      routes/           mapeiam URL → controller
      middlewares/      autenticação e autorização, tratamento de erros, log (a validação Zod é chamada nos controllers)
      validators/       esquemas Zod
      utils/            CPF, erros de domínio
  mobile/
    app/                telas (Expo Router) — a View
    src/
      components/       componentes visuais reutilizáveis
      contexts/         sessão do usuário e estado da sincronização
      hooks/            ligação entre telas e dados (listagens, formulários, conectividade)
      types/            tipos das entidades
      database/         conexão e migrações do SQLite local
      repositories/     leitura/gravação no SQLite local
      services/         cliente HTTP, autenticação, sincronização, ViaCEP
      validation/       esquemas Zod e máscaras
      theme/            cores, espaçamentos
```
