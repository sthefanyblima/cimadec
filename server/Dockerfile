# Imagem de produção da API do CIMADEC (Google Cloud Run).
FROM node:20-slim

# O Prisma precisa do OpenSSL no Debian slim.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependências (inclui o CLI do Prisma para generate/migrate).
COPY package*.json ./
RUN npm ci

# Copia o restante do código e gera o Prisma Client.
COPY . .
RUN npx prisma generate

ENV NODE_ENV=production
# Cloud Run injeta a variável PORT (padrão 8080); o app já a respeita.
EXPOSE 8080

# Aplica as migrations pendentes e sobe a API.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
