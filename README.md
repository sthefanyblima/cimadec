# CIMADEC – Plataforma de Gestão de Crises Urbanas

![Status](https://img.shields.io/badge/status-prot%C3%B3tipo-blue)
![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-orange)
![Backend](https://img.shields.io/badge/backend-Express%2FPrisma%2FPostgreSQL-green)
![License](https://img.shields.io/badge/license-Acad%C3%AAmico-lightgrey)

## Sobre o Projeto

O **CIMADEC (Centro Integrado de Monitoramento e Análise de Desastres e Crises)** é uma plataforma web para monitoramento e gerenciamento de ocorrências urbanas na cidade de **Maceió – AL**.

A proposta é funcionar como uma ponte entre a população e os órgãos de gestão urbana, permitindo o registro e acompanhamento de situações de risco. Entre as ocorrências monitoradas: enchentes, deslizamentos de encostas, acúmulo irregular de lixo, queda de árvores e problemas de infraestrutura.

---

## Arquitetura

O projeto tem **duas partes**:

```text
/
├── (raiz)        → Front-end estático (HTML, Tailwind, JavaScript)
│   ├── index.html
│   ├── css/      → estilos particionados
│   ├── js/       → módulos da aplicação
│   └── views/    → componentes de tela (carregados via fetch)
│
└── server/       → Back-end (API REST) — ver server/README.md
    ├── src/      → Express (rotas, controllers, middlewares)
    └── prisma/   → schema e migrations (PostgreSQL)
```

- **Front-end:** SPA leve, sem framework. Componentes carregados dinamicamente e mapa interativo (Leaflet). Autenticação **consome a API própria** (`server/`).
- **Back-end:** API REST em Express + PostgreSQL/Prisma, com cadastro/login (bcrypt) e **sessão em cookie httpOnly (JWT)**.

> **Estado atual da integração:** a **autenticação** (cadastro, login, sessão, rota privada) já é servida pela API. O **registro de ocorrências** ainda usa `localStorage` no front — a migração para a API é o próximo passo (Projeto Final). A API já expõe o CRUD de ocorrências pronto para essa integração.

---

## Tecnologias

### Front-end
| Tecnologia | Finalidade |
|------------|------------|
| HTML5 / CSS3 | Estrutura semântica e estilos |
| Tailwind CSS | Layout responsivo e utilitário |
| JavaScript ES6+ | Interatividade e lógica |
| Leaflet.js + OpenStreetMap/CartoDB | Mapa interativo |
| Chart.js | Visualização de dados |
| Phosphor Icons | Ícones |

### Back-end
| Tecnologia | Finalidade |
|------------|------------|
| Node.js + Express | API REST (rotas e controllers) |
| PostgreSQL + Prisma | Persistência e modelagem |
| bcryptjs | Hash de senha |
| JWT + cookie httpOnly | Sessão |
| Zod | Validação de entrada |

---

## Perfis de Usuário

### Cidadão
Registra ocorrências georreferenciadas, acompanha o histórico de protocolos e vê o status. Recebe um radar de entorno com ocorrências próximas.

### Operador / Defesa Civil
Monitora e analisa as ocorrências: dashboard analítico, mapa operacional, fila de triagem, atualização de status e exportação de relatórios (CSV).

> Cadastro público cria sempre um **cidadão**. Contas de **operador** são criadas pela equipe (via seed / rota administrativa) — o back-end bloqueia o auto-registro como operador.

---

## Como Executar

O projeto precisa do **back-end rodando** para cadastro/login. Suba os dois:

### 1. Back-end (API — porta 3000)

Instruções completas em [`server/README.md`](server/README.md). Resumo:

```bash
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
docker compose up -d        # sobe o PostgreSQL (precisa do Docker)
npm run prisma:migrate      # cria as tabelas
npm run seed                # (opcional) usuários de exemplo
npm run dev                 # → http://localhost:3000
```

Usuários do seed: `operador@cimadec.gov.br / 123456` e `cidadao@exemplo.com / 123456`.

### 2. Front-end (site estático — porta 5500)

O front usa `fetch` para carregar componentes, então **não pode** abrir via `file://` — use um servidor HTTP:

```bash
# na raiz do projeto
python -m http.server 5500          # → http://localhost:5500
```

Ou, no VS Code: botão direito no `index.html` → **Open with Live Server**.

> **Importante:** o `CORS_ORIGIN` no `.env` do back precisa bater com a URL do front (padrão `http://localhost:5500`). Se rodar o front em outra porta, ajuste essa variável.

### Portas

| Serviço | Porta |
|---|---|
| API (back) | 3000 |
| PostgreSQL | 5432 |
| Front | 5500 |

---

## Funcionalidades

- **Autenticação real:** cadastro e login via API (senha com bcrypt), sessão em cookie httpOnly, persistência entre recarregamentos e logout.
- **Landing page** responsiva com apresentação do problema e portal de acesso.
- **Registro de ocorrências** com formulário validado, captura de coordenadas no mapa e reverse geocoding (Nominatim/OSM).
- **Dashboards** de cidadão e operador com indicadores e gráfico (Chart.js).
- **Mapa interativo** com marcadores das ocorrências.
- **Fila de triagem** com atualização de status (operador).
- **Exportação de relatórios** em CSV (operador).
- **Feedback visual** por toasts e diálogos de confirmação.

---

## Limitações Conhecidas

- O **registro de ocorrências** ainda persiste em `localStorage` (a autenticação já é via API; a migração das ocorrências é o próximo passo).
- Upload de imagens é simulado.
- Sem integração com órgãos públicos (INMET, CEMADEN, OpenWeather).
- Alertas de sensores (IoT) são simulados no front.
- Sem deploy publicado ainda.

---

## Trabalhos Futuros

- Migrar o CRUD de ocorrências para a API (concluir a integração front/back).
- Autorização por papéis mais granular.
- Upload real de imagens.
- Deploy (front no GitHub Pages, back no Cloud Run).
- Integrações externas (INMET, CEMADEN, OpenWeather).

---

## Licença

Projeto com finalidade exclusivamente acadêmica e educacional. Uso livre para estudos e demonstrações.

---

**CIMADEC © 2026 – Centro Integrado de Monitoramento e Análise de Desastres e Crises**
