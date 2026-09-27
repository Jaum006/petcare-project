# PetCare — App mobile (View)

App do PetCare para pet shops e clínicas veterinárias, feito com **React Native + Expo + TypeScript**.
É a camada **View** da arquitetura MVC do projeto; a API (Controller + Model) fica na pasta `../api`.
A especificação completa (modelo de dados, regras de negócio, contrato da API e sincronização) está em
`../docs/especificacao-tecnica.md`.

## Pré-requisitos

- **Node.js** 20 ou superior (testado com Node 24) e npm.
- Celular Android ou iPhone com o app **Expo Go** instalado (Play Store / App Store).
- **Celular e computador na mesma rede Wi-Fi.**
- A API do PetCare rodando no computador (veja `../api/README.md`). Ela escuta na porta `3333`.

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

   Edite o `.env` e troque o IP pelo **IP do seu computador na rede local**:

   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.10:3333/api
   ```

   - Windows: rode `ipconfig` e use o "Endereço IPv4" do adaptador Wi-Fi.
   - Linux/macOS: rode `ip addr` ou `ifconfig`.
   - **Não use `localhost`**: no celular, `localhost` é o próprio celular, não o computador.
   - Para conferir, abra `http://SEU_IP:3333/api/health` no navegador do celular; deve aparecer `{"status":"ok"}`.
   - Se a API não responder pelo IP, libere a porta 3333 no firewall do Windows.

3. Inicie o app:

   ```bash
   npx expo start
   ```

4. Abra o **Expo Go** no celular e leia o QR code que aparece no terminal
   (no iPhone, leia com a câmera).

Sempre que alterar o `.env`, pare o servidor e rode `npx expo start --clear`.

### Se o QR code não conectar

Redes de faculdade ou empresa às vezes bloqueiam a comunicação entre aparelhos. Use o modo túnel:

```bash
npx expo start --tunnel
```

Observação: o túnel resolve a conexão do **app** com o computador, mas o app ainda precisa alcançar a
**API** pelo endereço do `.env`. Se o celular não alcançar o IP do computador, publique a API
ou use um roteador/hotspot próprio.

### Usuários de teste

O seed da API cria dois usuários (senha `petcare123`):

| E-mail | Perfil |
|---|---|
| recepcao@petcare.com | Recepção (pode cadastrar, editar e excluir tutores) |
| veterinario@petcare.com | Veterinário (somente consulta) |

## Como funciona o modo offline

O app é **offline-first** (requisitos R5/R6):

1. Toda gravação (novo tutor, edição, exclusão) vai **primeiro para o SQLite do celular**, marcada como
   *pendente*. Por isso o app funciona mesmo sem internet.
2. A **sincronização** acontece ao abrir o app, quando a conexão volta, ao puxar a lista de tutores para
   baixo, depois de cada gravação e no botão **"Sincronizar agora"** (telas Início e Mais):
   - **Envio**: cada registro pendente é enviado à API (`PUT` para incluir/alterar, `DELETE` para excluir).
   - **Recebimento**: o app busca na API o que mudou desde a última sincronização.
3. Se a API recusar uma inclusão ou alteração por regra de negócio (ex.: CPF já cadastrado),
   o tutor aparece com o selo **"Erro ao sincronizar"** e a mensagem da API na tela de detalhes.
   Basta corrigir e salvar novamente para reenviar. Se recusar uma **exclusão** (ex.: tutor com pets
   vinculados), o tutor volta a aparecer normalmente e o app mostra o alerta **"Exclusão não realizada"** com o motivo.
   Alterações pendentes de um usuário da Recepção só são enviadas enquanto alguém da Recepção estiver conectado.
4. Sem conexão aparece a faixa **"Você está offline — as alterações serão enviadas quando a conexão voltar."**
5. A sessão fica salva no celular (SecureStore); é possível abrir o app offline. Se o token expirar
   (8 horas), o app pede login novamente — as pendências continuam guardadas.

Limitação conhecida: em conflitos vale a **última gravação enviada** (*last write wins*).

Para testar: ative o modo avião, cadastre um tutor (ele aparece como "Aguardando envio"),
desative o modo avião e veja o selo sumir após a sincronização.

## Estrutura de pastas

```
app/                 telas (Expo Router) — só exibem dados e chamam hooks/serviços
  _layout.tsx        provedores (sessão, sincronização) e proteção de rotas
  login.tsx          login
  cadastro.tsx       cadastro de usuário
  (tabs)/            abas: Início, Tutores, Pets, Consultas, Mais
    tutores/         lista, detalhe, novo e editar tutor
src/
  components/        componentes visuais reutilizáveis (CampoTexto, Botao, EstadoVazio...)
  contexts/          AuthContext (sessão) e SyncContext (estado da sincronização)
  database/          conexão com o SQLite e migrações (PRAGMA user_version)
  hooks/             estado das telas (lista de tutores, formulário, conexão)
  repositories/      leitura/gravação no SQLite local (SQL fica só aqui)
  services/          cliente HTTP, autenticação, sincronização, ViaCEP e regras do tutor
  theme/             cores, espaçamentos e tamanhos de fonte
  types/             tipos TypeScript (Tutor, Usuario)
  validation/        esquemas Zod, validação de CPF e máscaras
```

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npx expo start` | inicia o servidor de desenvolvimento |
| `npm run typecheck` | verifica os tipos TypeScript |
| `npm run lint` | analisa o código com ESLint |
| `npx expo-doctor` | verifica dependências e configuração do Expo |
