# Guia de Deploy — CIMADEC

Publicação: **front no GitHub Pages** e **back no Google Cloud Run**, com **PostgreSQL no Neon**.

Ordem geral: **Banco (Neon) → API (Cloud Run) → apontar o front para a API → GitHub Pages**.

Valores usados como exemplo (ajuste para os seus):
- Usuário/repo GitHub: `sthefanyblima/cimadec`
- URL do front (Pages): `https://sthefanyblima.github.io/cimadec/`
- Origin do front (para o CORS): `https://sthefanyblima.github.io`

---

## 1. Banco de dados — Neon (PostgreSQL)

1. Crie uma conta em https://neon.tech e um projeto novo.
2. Copie a **connection string** (formato `postgresql://user:senha@host/db?sslmode=require`).
3. Guarde — será a `DATABASE_URL` da API em produção.

---

## 2. Instalar e configurar o gcloud CLI

1. Instale o Google Cloud CLI: https://cloud.google.com/sdk/docs/install (Windows: baixe o instalador).
2. No terminal:

```bash
gcloud init                       # faz login e escolhe/cria um projeto
gcloud auth login                 # se necessário
gcloud config set project SEU_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

> **Project ID é único no mundo todo.** Se `gcloud init` falhar ao criar um projeto com
> `409 ALREADY_EXISTS`, o ID já está em uso. Reaproveite um projeto existente
> (`gcloud config set project SEU_PROJECT_ID`) ou crie um com ID único:
> `gcloud projects create cimadec-app-2026 --name="CIMADEC"` (troque o sufixo se colidir).

> Cloud Run exige billing ativo no projeto (há free tier, mas precisa de cartão cadastrado).
> Confirme em https://console.cloud.google.com/billing que o projeto está vinculado a uma conta.

---

## 3. Deploy da API no Cloud Run

Gere um segredo forte para o JWT:

```bash
# escolha um destes
openssl rand -base64 48
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Na pasta `server/`, faça o deploy a partir do código (o Cloud Build usa o `Dockerfile`).

**Windows (cmd.exe) — comando em UMA linha, tudo entre aspas:**

```bat
cd /d C:\caminho\para\cimadec\server
gcloud run deploy cimadec-api --source . --region southamerica-east1 --allow-unauthenticated --set-env-vars "DATABASE_URL=postgresql://user:senha@host/db?sslmode=require,JWT_SECRET=SEU_SEGREDO,JWT_EXPIRES_IN=1d,NODE_ENV=production,CORS_ORIGIN=https://sthefanyblima.github.io"
```

**Linux/macOS (bash):**

```bash
cd server
gcloud run deploy cimadec-api \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://user:senha@host/db?sslmode=require,JWT_SECRET=SEU_SEGREDO,JWT_EXPIRES_IN=1d,NODE_ENV=production,CORS_ORIGIN=https://sthefanyblima.github.io"
```

Notas:
- No **cmd.exe** não quebre em várias linhas nem use `\`; mantenha tudo entre aspas (protege o `&` da URL).
- O formato simples separado por vírgula funciona porque nenhum valor contém vírgula. Se a sua
  `DATABASE_URL` tiver vírgula, troque o separador: `--set-env-vars "^@^DATABASE_URL=...@JWT_SECRET=...@..."`.
- `CORS_ORIGIN` é o **origin** do front (sem caminho e sem barra no fim).
- Não defina `PORT` — o Cloud Run injeta automaticamente.
- O `Dockerfile` roda `prisma migrate deploy` no start, então as tabelas são criadas no Neon no primeiro boot.

Ao final, o comando imprime a **Service URL** (algo como `https://cimadec-api-xxxxx.southamerica-east1.run.app`). Guarde.

Teste:

```bash
curl https://SUA-URL.run.app/api/health      # deve responder {"status":"ok"}
```

---

## 4. Apontar o front para a API e publicar

1. Edite `js/api.js` e troque o placeholder pela sua Service URL (mantendo o `/api` no fim):

```js
const API_BASE = rodandoLocal
    ? 'http://localhost:3000/api'
    : 'https://cimadec-api-xxxxx.southamerica-east1.run.app/api';
```

2. Commit e push:

```bash
git add js/api.js
git commit -m "chore: aponta o front para a API em produção"
git push origin main
```

---

## 5. Ativar o GitHub Pages (front)

1. No GitHub: **Settings → Pages**.
2. **Source:** Deploy from a branch → **Branch: `main`** / pasta **`/ (root)`** → Save.
3. Aguarde ~1 min. O site fica em `https://sthefanyblima.github.io/cimadec/`.

---

## 6. Criar o usuário operador em produção (OBRIGATÓRIO para a demo)

O cadastro público cria só cidadãos, e a tela de acesso tem o botão **"Entrar como Operador (demo)"**
que usa a conta do seed. Para essa conta existir no banco de produção, rode o seed uma vez
apontando para o Neon (a partir de `server/`):

```bash
cd server
# Windows PowerShell:
$env:DATABASE_URL="postgresql://user:senha@host/db?sslmode=require"; npm run seed
# Git Bash:
DATABASE_URL="postgresql://user:senha@host/db?sslmode=require" npm run seed
```

Credenciais criadas: `operador@cimadec.gov.br / 123456` e `cidadao@exemplo.com / 123456`.

---

## 7. Testar o site publicado

1. Abra `https://sthefanyblima.github.io/cimadec/`.
2. Cadastre-se, faça login, recarregue (a sessão deve persistir) e registre uma ocorrência.
3. Entre como operador e mude o status de uma ocorrência.

---

## Variáveis de ambiente (Cloud Run)

| Variável | Exemplo | Observação |
|---|---|---|
| `DATABASE_URL` | `postgresql://...?sslmode=require` | Connection string do Neon |
| `JWT_SECRET` | (string longa aleatória) | Segredo do JWT |
| `JWT_EXPIRES_IN` | `1d` | Validade do token |
| `NODE_ENV` | `production` | Ativa cookie `SameSite=None; Secure` |
| `CORS_ORIGIN` | `https://sthefanyblima.github.io` | Origin do front |
| `PORT` | (automático) | Injetado pelo Cloud Run |

---

## Solução de problemas

- **Login funciona mas a sessão não persiste no site publicado:** confirme `NODE_ENV=production`
  no Cloud Run (é o que liga `SameSite=None; Secure` no cookie) e que ambos os sites são HTTPS.
- **Erro de CORS no console:** `CORS_ORIGIN` deve ser exatamente o origin do front
  (`https://sthefanyblima.github.io`, sem caminho e sem `/` no fim).
- **Front chama `localhost:3000` em produção:** você esqueceu de trocar a URL em `js/api.js` (passo 4).
- **API sobe mas erra no banco:** confira a `DATABASE_URL` do Neon (com `?sslmode=require`).
