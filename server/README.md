# CIMADEC — Back-end (API REST)

API do CIMADEC (Centro Integrado de Monitoramento e Análise de Desastres e Crises).
Entrega do **checkpoint de back-end (Avaliação 2)**: API REST em Express, PostgreSQL com
Prisma, cadastro/login com bcrypt e sessão em cookie.

## Stack

- **Node.js + Express** — API REST organizada em rotas e controllers
- **PostgreSQL + Prisma** — persistência e modelagem
- **bcryptjs** — hash de senha
- **JWT em cookie httpOnly** — sessão
- **Zod** — validação de entrada

## Entidades

Duas entidades relacionadas (`User 1—N Ocorrencia`):

### User
| Campo | Tipo | Observação |
|---|---|---|
| id | String (uuid) | PK |
| nome | String | |
| email | String | único |
| senhaHash | String | senha com hash bcrypt (nunca em texto puro) |
| role | Enum `CIDADAO` \| `OPERADOR` | padrão `CIDADAO` |
| createdAt / updatedAt | DateTime | |

### Ocorrencia
| Campo | Tipo | Observação |
|---|---|---|
| id | String (uuid) | PK |
| categoria | Enum `ENCHENTE` \| `DESLIZAMENTO` \| `LIXO` \| `QUEDA_ARVORE` \| `INFRAESTRUTURA` \| `OUTRO` | |
| descricao | String | |
| endereco | String | |
| latitude / longitude | Float? | opcionais (georreferenciamento) |
| status | Enum `RECEBIDO` \| `EM_ANALISE` \| `RESOLVIDO` \| `CRITICO` | padrão `RECEBIDO` |
| autorId | String | FK → User |
| createdAt / updatedAt | DateTime | |

## Endpoints principais

Base: `/api`

### Autenticação
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | público | Cadastro (`nome`, `email`, `senha`) — sempre cria `CIDADAO` |
| POST | `/auth/login` | público | Login → grava cookie `cimadec_token` |
| POST | `/auth/logout` | público | Limpa o cookie de sessão |
| GET | `/auth/me` | **privada** | Dados do usuário logado |

### Ocorrências (fluxo principal — todas privadas)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/ocorrencias` | Cria ocorrência (autor = usuário logado) |
| GET | `/ocorrencias` | Lista (operador: todas; cidadão: as suas) |
| GET | `/ocorrencias/:id` | Detalhe |
| PUT | `/ocorrencias/:id` | Edita / atualiza status |
| DELETE | `/ocorrencias/:id` | Remove |

> Regra de acesso mínima: `OPERADOR` acessa qualquer ocorrência; `CIDADAO` só as próprias.

Healthcheck: `GET /api/health` → `{ "status": "ok" }`

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | Segredo para assinar o JWT (use valor longo e aleatório) |
| `JWT_EXPIRES_IN` | Validade do token (ex.: `1d`) |
| `PORT` | Porta da API (padrão `3000`) |
| `NODE_ENV` | `development` \| `production` |
| `CORS_ORIGIN` | Origem do front permitida no CORS |

## Como rodar localmente

Pré-requisitos: Node 18+ e um PostgreSQL acessível (há um `docker-compose.yml` pronto).

```bash
cd server

# 1) Instalar dependências
npm install

# 2) Configurar ambiente
cp .env.example .env        # no Windows: copy .env.example .env

# 3) Subir o PostgreSQL (opcional — se já tiver um banco, pule e ajuste DATABASE_URL)
docker compose up -d

# 4) Criar as tabelas (migration) e gerar o client Prisma
npm run prisma:migrate      # cria a migration inicial

# 5) (opcional) Popular dados de exemplo
npm run seed

# 6) Subir a API
npm run dev                 # http://localhost:3000
```

Usuários de exemplo (após `npm run seed`):
- **Operador:** `operador@cimadec.gov.br` / `123456`
- **Cidadão:** `cidadao@exemplo.com` / `123456`

## Exemplo de uso (curl)

```bash
# Cadastro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana","email":"ana@exemplo.com","senha":"123456"}'

# Login (guarda o cookie de sessão em cookies.txt)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"ana@exemplo.com","senha":"123456"}'

# Rota privada usando o cookie
curl http://localhost:3000/api/auth/me -b cookies.txt

# Criar ocorrência (rota privada)
curl -X POST http://localhost:3000/api/ocorrencias \
  -H "Content-Type: application/json" -b cookies.txt \
  -d '{"categoria":"LIXO","descricao":"Acúmulo de lixo na esquina","endereco":"Rua X, Maceió"}'
```

## Escopo

Cobre as obrigatoriedades da Avaliação 2. **Fora de escopo** (conforme o PDF do curso):
deploy, integração completa do front, publicação, testes automatizados, CI/CD e
autorização por múltiplos papéis (há apenas a checagem mínima dono/operador).
