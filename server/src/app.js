// Montagem do app Express: middlewares globais, rotas e tratamento de erros.
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { ocorrenciaRoutes } from "./routes/ocorrencia.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";

export function createApp() {
  const app = express();

  // Em produção a API fica atrás do proxy do Cloud Run — necessário para o
  // rate limit identificar o IP real (via X-Forwarded-For) e para o cookie secure.
  if (env.isProd) app.set("trust proxy", 1);

  // Cabeçalhos de segurança (HSTS, no-sniff, frameguard, etc.).
  app.use(helmet());
  // Limita o tamanho do corpo (mitiga DoS por payload gigante).
  app.use(express.json({ limit: "16kb" }));
  app.use(cookieParser());
  // credentials: true permite o front enviar/receber o cookie de sessão.
  app.use(cors({ origin: env.corsOrigin, credentials: true }));

  // Anti brute-force: limita tentativas nas rotas sensíveis de autenticação.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

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
