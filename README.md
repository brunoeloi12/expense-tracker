# 🏛️ Fintec — Financial Intelligence & Expense Tracker

<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wallet.svg" width="64" height="64" alt="Fintec Logo" />
</p>

<p align="center">
  <strong>O controle financeiro onde a precisão de engenharia encontra a elegância do design editorial.</strong><br>
  Uma plataforma moderna de gestão financeira desenhada sob a estética <em>Paper & Ink</em>, com reatividade em tempo real, consistência matemática estrita e arquitetura monorepo de altíssimo desempenho.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-12.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Fastify-5.12-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify" />
  <img src="https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Turborepo-Latest-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 🌟 Por que o Fintec é Diferente?

Planilhas convencionais são frias e propensas a erros manuais. A maioria dos aplicativos de finanças do mercado é poluída com anúncios, gráficos genéricos e interfaces burocráticas.

O **Fintec** foi concebido sob três pilares inegociáveis:

1. **Estética Editorial Intencional (Paper & Ink):** Inspirado nas publicações impressas de alta classe e no minimalismo suíço. Tipografia nobre (_Instrument Serif_ e _Instrument Sans_), paleta calmante em tons de linho, papel mineral e tinta preta, acompanhado de microinterações físicas suaves via **GSAP** e **Framer Motion**, além de ambientação 3D com **Three.js**. Cuidar do seu dinheiro agora é uma experiência sofisticada e prazerosa.
2. **Precisão Financeira Cirúrgica:** Zero tolerância a erros de arredondamento de ponto flutuante (o famoso problema `0.1 + 0.2 = 0.30000000000000004` do padrão IEEE 754). No Fintec, todos os valores são manipulados e persistidos no banco estritamente em **centavos inteiros (`amountCents`)**, garantindo exatidão contábil absoluta.
3. **Reatividade Instantânea & Tempo Real:** Alterou um lançamento no computador ou celular? O saldo e os gráficos se recalibram no mesmo instante através de um canal contínuo de **Server-Sent Events (SSE)** integrado ao **Redis Pub/Sub** e orquestrado pelo **TanStack Query**.

---

## 📐 Arquitetura da Solução

O projeto é estruturado em um **Monorepo** moderno governado pelo **Turborepo** e **pnpm workspaces**, garantindo reutilização integral de tipos e regras de validação entre cliente e servidor.

```mermaid
flowchart TD
    subgraph Client["💻 Frontend — Next.js 16 + React 19"]
        UI["🎨 Interface Editorial (Tailwind v4 + GSAP)"]
        Canvas3D["✨ Three.js / R3F Background"]
        RQ["⚡ TanStack Query v5 (Cache Reativo)"]
        SSE_Client["📡 SSE Consumer (Exponential Backoff)"]
    end

    subgraph Shared["📦 @fincontrol/shared"]
        ZOD["🛡️ Schemas Zod & Contratos TypeScript"]
    end

    subgraph Server["⚡ Backend — NestJS 12 + Fastify Engine"]
        API["🚪 REST Endpoints (Guard + ZodPipe)"]
        SSE_Stream["📡 SSE Emitter (RxJS Observable)"]
        AuthSec["🔐 Argon2id + Constant-Time Hashing"]
    end

    subgraph Infra["🗄️ Infraestrutura & Dados"]
        PG[("🐘 PostgreSQL (Prisma 7 + UUIDv7)")]
        REDIS[("⚡ Redis 7 (Pub/Sub & Cache de Saldo)")]
    end

    UI --> ZOD
    API --> ZOD
    UI -->|"HTTP Requests"| API
    API -->|"Persistência / Queries"| PG
    API -->|"Invalidação & Eventos"| REDIS
    REDIS -->|"Pub/Sub Message"| SSE_Stream
    SSE_Stream -->|"Stream SSE (text/event-stream)"| SSE_Client
    SSE_Client -->|"Invalidate Queries"| RQ
    RQ --> UI
```

---

## 🛠️ Tecnologias e Como São Utilizadas

### 1. Frontend (`apps/web`)

| Tecnologia                                            | Função no Projeto                                                                                                                                                                                                           |
| :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 (App Router)**                           | Framework full-stack que gerencia rotas dinâmicas, _Server-Side Rendering_, otimização estática e middlewares de borda para proteção de rotas com cookies de autenticação (`middleware.ts`).                                |
| **React 19**                                          | Biblioteca base na versão mais recente, aproveitando transições assíncronas, manipulação de estado granular e otimização de renderização com concorrência moderna.                                                          |
| **Three.js & @react-three/fiber (@react-three/drei)** | Renderização de canvas 3D acelerado por hardware (`Background3D.tsx`). Um campo de estrelas esférico interativo e procedural com 5.000+ pontos que traz profundidade à tela de autenticação.                                |
| **GSAP (GreenSock Animation Platform)**               | Utilizado nos marcadores de valor monetário (`AnimatedBalance.tsx` e contador de saldo do dashboard). Realiza a contagem física suave dos números com curvas de aceleração `power3.out` e interpolação precisa de centavos. |
| **Framer Motion**                                     | Coordena orquestrações de entrada escalonadas (_stagger_), expansões elásticas de modais, transições de gavetas e animação de altura das barras no gráfico diário.                                                          |
| **TanStack React Query v5**                           | Camada de gerenciamento de estado assíncrono do cliente. Mantém o cache de transações, contas e categorias, gerenciando refetch otimista e invalidações automáticas disparadas pelos eventos de tempo real.                 |
| **Tailwind CSS v4**                                   | Utilizado com a nova especificação nativa `@theme inline`, definindo as variáveis e tipografia sob medida do design system editorial (`--color-paper`, `--color-ink`, `--color-accent`, etc.).                              |
| **React Hook Form + Zod Resolver**                    | Formulários de alta performance com validação controlada na digitação e no submit, sem re-renderizações desnecessárias de página.                                                                                           |
| **Instrument Serif & Instrument Sans**                | Fontes tipográficas contemporâneas de padrão editorial, elevando a percepção de valor e sobriedade do produto.                                                                                                              |

---

### 2. Backend (`apps/api`)

| Tecnologia                                             | Função no Projeto                                                                                                                                                                                                     |
| :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NestJS 12**                                          | Arquitetura corporativa em módulos, _Dependency Injection_, _Guards_, _Pipes_ e separação cirúrgica de responsabilidades (Users, Auth, Accounts, Categories, Transactions).                                           |
| **Fastify (`@nestjs/platform-fastify`)**               | Substitui o Express como motor HTTP do NestJS. Oferece até 4x mais requisições por segundo e latência expressivamente menor, ideal para rotas transacionais de alto tráfego.                                          |
| **Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`)** | ORM de ponta com driver adapters diretos para Postgres. Proporciona consultas fortemente tipadas, relações estritas e migrações determinísticas.                                                                      |
| **PostgreSQL 15**                                      | Banco de dados relacional primário. Configurado para gerar chaves primárias **UUIDv7** cronologicamente ordenadas (`@default(uuid(7))`), maximizando a eficiência de indexação B-Tree e ordenação temporal natural.   |
| **Redis 7 (`ioredis`)**                                | Usado duplamente como mensageiro **Pub/Sub** para emitir eventos de criação/edição/deleção de transações entre nós, e como camada de invalidação rápida de cache de saldos por usuário.                               |
| **Server-Sent Events (SSE)**                           | Endpoint reativo `@Sse('events')` via **RxJS Observable**. Mantém uma conexão HTTP aberta e duradoura por cliente, disparando notificações instantâneas com isolamento de contexto de usuário.                        |
| **Argon2id (`argon2`)**                                | Algoritmo vencedor da competição mundial de hash de senhas. Configurado com alto consumo de memória e paralelismo (`memoryCost: 65536, timeCost: 3, parallelism: 4`), resistente a ataques via GPU.                   |
| **Constant-Time Verification**                         | Mitigação contra _Timing Attacks_: mesmo se o e-mail não existir no login, o backend executa um hash simulado de mesmo custo temporal para evitar vazamento de existência de usuários por diferença de milissegundos. |
| **Segurança em Camadas**                               | `@fastify/helmet` para blindagem de cabeçalhos HTTP, `@fastify/rate-limit` (100 req/min) para contenção de abuso/DDoS, e `@fastify/cookie` assinado com chave secreta.                                                |

---

### 3. Pacotes Compartilhados & Engenharia Monorepo (`packages/*`)

| Tecnologia                 | Função no Projeto                                                                                                                                                                                                                                           |
| :------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@fincontrol/shared`**   | Biblioteca interna compartilhada entre Web e API. Exporta todos os schemas e tipos inferidos do **Zod** (Login, Registro, Transações, Filtros por período, etc.). Se o schema mudar, ambos os lados são atualizados automaticamente em tempo de compilação. |
| **`@fincontrol/tsconfig`** | Configurações estritas e padronizadas de TypeScript (`base.json`, `nestjs.json`, `nextjs.json`) estendidas por todos os pacotes.                                                                                                                            |
| **Turborepo**              | Orquestrador de tarefas do monorepo. Executa `build`, `lint`, `typecheck` e `dev` com paralelismo e cache inteligente de artefatos.                                                                                                                         |
| **Oxlint**                 | Linter de última geração baseado em **Rust**, rodando dezenas de vezes mais rápido que o ESLint convencional com análise `type-aware`.                                                                                                                      |
| **Vitest**                 | Suíte ultrarrápida de testes unitários e de integração E2E com suporte nativo a ESM e TypeScript sem etapa prévia de compilação.                                                                                                                            |
| **Husky & Commitlint**     | Garantem a saúde do repositório através de Git Hooks que validam mensagens de commit no padrão _Conventional Commits_ e executam linters com _lint-staged_ antes de qualquer push.                                                                          |

---

## 💎 Funcionalidades em Destaque

- [x] **Visão Geral Inteligente:** Dashboard dinâmico mostrando _"Quanto sobrou até agora"_, total de entradas e saídas do mês.
- [x] **Contador Animado de Saldo:** Integração de física de movimento que valoriza o impacto das movimentações com precisão de centavos.
- [x] **Gráfico de Movimentação Diária (Últimos 30 dias):** Visualização proporcional do volume diário com tooltips e transições animadas.
- [x] **Transações com Classificação & Contas:** Controle de múltiplas carteiras (Bancos, Dinheiro Físico, Investimentos) e categorias com tags de cores personalizadas.
- [x] **Reatividade em Tempo Real via SSE:** Mudanças feitas em qualquer sessão refletem automaticamente no painel sem necessidade de recarregar a página.
- [x] **Deleção Segura (Soft Delete):** Transações possuem registro de `deletedAt`, permitindo auditoria e integridade histórica.
- [x] **Sessões Multi-Dispositivo com Refresh Tokens:** Tokens de acesso JWT de curta expiração (15 min) e Refresh Tokens de 7 dias com hash no banco e suporte a revogação ativa.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** (v20+ recomendado)
- **pnpm** (v11 ou superior): `npm i -g pnpm`
- **Docker** e **Docker Compose**

---

### Passo 1: Clonar o repositório e instalar as dependências

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/expense-tracker.git
cd expense-tracker

# Instale todas as dependências do monorepo
pnpm install
```

---

### Passo 2: Configurar as Variáveis de Ambiente

Crie o arquivo `.env` dentro de `apps/api`:

```bash
cp apps/api/.env.example apps/api/.env
```

Exemplo de configuração para o `apps/api/.env`:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Conexão com o Banco de Dados (PostgreSQL)
DATABASE_URL="postgresql://root:rootpassword@localhost:5432/fincontrol?schema=public"

# Conexão com o Cache e Mensageria (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Segredos Criptográficos
JWT_SECRET="seu-jwt-secret-super-seguro-com-minimo-32-chars"
COOKIE_SECRET="seu-cookie-secret-super-seguro-com-minimo-32-chars"
```

---

### Passo 3: Iniciar a Infraestrutura (Banco e Cache)

Suba as instâncias de PostgreSQL e Redis via Docker Compose:

```bash
docker compose up -d
```

---

### Passo 4: Executar as Migrações do Prisma

Aplique a estrutura do banco de dados e gere o Prisma Client:

```bash
pnpm --filter api exec prisma migrate dev
```

---

### Passo 5: Iniciar todas as aplicações (Monorepo)

Inicie simultaneamente o backend, frontend e os pacotes compartilhados via Turborepo:

```bash
pnpm turbo dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 🧪 Qualidade de Código & Testes

Para garantir que cada linha entregue esteja impecável, o projeto conta com ferramentas de ponta:

```bash
# Executar todos os testes com Vitest
pnpm --filter api test

# Executar testes unitários com cobertura de código
pnpm --filter api test:cov

# Executar testes de ponta a ponta (E2E)
pnpm --filter api test:e2e

# Executar o linter ultra-rápido com Oxlint
pnpm --filter api lint
```

---

## 📁 Estrutura de Diretórios

```
expense-tracker/
├── apps/
│   ├── api/                        # Backend NestJS 12 com Fastify
│   │   ├── prisma/                 # Schema do banco de dados (UUIDv7, Models)
│   │   └── src/
│   │       ├── common/             # Guards de Auth, Pipes de validação Zod
│   │       ├── infra/              # Módulos de conexão (Prisma, Redis)
│   │       └── modules/            # Auth, Users, Accounts, Categories, Transactions
│   └── web/                        # Frontend Next.js 16 + React 19
│       └── src/
│           ├── app/                # App Router (Rotas autenticadas e públicas)
│           ├── components/         # Canvas 3D, Animações GSAP, Gráficos, Modais
│           ├── hooks/              # Hooks customizados (TanStack Query + SSE)
│           └── lib/                # Cliente de API e utilitários
├── packages/
│   ├── shared/                     # Schemas e contratos tipados compartilhados (Zod)
│   └── tsconfig/                   # Configurações TypeScript reaproveitáveis
├── docker-compose.yml              # Serviços PostgreSQL e Redis Alpine
├── pnpm-workspace.yaml             # Configuração de workspaces pnpm
└── turbo.json                      # Pipelines e cache inteligente do Turborepo
```

---

## 👤 Autor

Desenvolvido com primor técnico por **Bruno Eloi**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com)

---

<p align="center">
  <em>Fintec — Reinventando a maneira como você se relaciona com o seu patrimônio.</em>
</p>
