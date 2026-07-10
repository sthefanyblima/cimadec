// Middleware central de tratamento de erros.
// Traduz erros conhecidos (AppError, validação Zod, Prisma) em respostas HTTP
// coerentes e evita vazar stack trace para o cliente.
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/http.js";
import { env } from "../config/env.js";

// Rota não encontrada — registrado depois de todas as rotas válidas.
export function notFound(req, res) {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// Assinatura de 4 args (err, req, res, next) é o que marca este como error handler no Express.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Corpo JSON malformado (express.json lança SyntaxError) -> 400, não 500.
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição." });
  }

  // Erro de validação de entrada (Zod).
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos.",
      detalhes: err.errors.map((e) => ({ campo: e.path.join("."), mensagem: e.message })),
    });
  }

  // Violação de restrição única do Prisma (ex.: e-mail já cadastrado).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(409).json({ error: "Registro já existe (valor único duplicado)." });
  }

  // Registro não encontrado no Prisma (ex.: update/delete de id inexistente).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return res.status(404).json({ error: "Registro não encontrado." });
  }

  // Erro de aplicação com status explícito.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Qualquer outra coisa: erro inesperado -> 500 sem vazar detalhes em produção.
  console.error("[erro inesperado]", err);
  return res.status(500).json({
    error: "Erro interno do servidor.",
    ...(env.isProd ? {} : { detalhe: err.message }),
  });
}
