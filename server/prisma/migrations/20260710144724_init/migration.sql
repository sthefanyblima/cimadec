-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CIDADAO', 'OPERADOR');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('ENCHENTE', 'DESLIZAMENTO', 'LIXO', 'QUEDA_ARVORE', 'INFRAESTRUTURA', 'OUTRO');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('RECEBIDO', 'EM_ANALISE', 'RESOLVIDO', 'CRITICO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CIDADAO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencias" (
    "id" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "descricao" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "Status" NOT NULL DEFAULT 'RECEBIDO',
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ocorrencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "ocorrencias_autorId_idx" ON "ocorrencias"("autorId");

-- CreateIndex
CREATE INDEX "ocorrencias_status_idx" ON "ocorrencias"("status");

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
