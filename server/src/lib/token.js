// Geração e leitura do JWT usado na sessão em cookie.
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Nome do cookie httpOnly que guarda a sessão.
export const SESSION_COOKIE = "cimadec_token";

export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn, algorithm: "HS256" });
}

export function verifyToken(token) {
  // Fixa o algoritmo aceito (evita ataques de confusão de algoritmo).
  return jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
}

// Opções do cookie de sessão.
// - httpOnly: JS do navegador não lê o cookie (protege contra XSS roubar o token).
// - Produção (front e back em domínios diferentes → cross-site): "none" + secure,
//   senão o navegador NÃO envia o cookie nas requisições cross-site.
// - Desenvolvimento (http://localhost): "lax" + secure=false para funcionar sem HTTPS.
export const cookieOptions = {
  httpOnly: true,
  sameSite: env.isProd ? "none" : "lax",
  secure: env.isProd,
  maxAge: 24 * 60 * 60 * 1000, // 1 dia
  path: "/",
};
