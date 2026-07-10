// Montagem do app Express: middlewares globais, rotas e tratamento de erros.
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { ocorrenciaRoutes } from "./routes/ocorrencia.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";

export function createApp() {
  const app = express();

  // Middlewares globais.
  app.use(express.json());
  app.use(cookieParser());
  // credentials: true permite o front enviar/receber o cookie de sessão.
  app.use(cors({ origin: env.corsOrigin, credentials: true }));

  // Healthcheck simples (público) — útil para verificar se a API está no ar.
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  // Rotas de domínio.
  app.use("/api/auth", authRoutes);
  app.use("/api/ocorrencias", ocorrenciaRoutes);

  // 404 e handler central de erros — sempre por último.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
