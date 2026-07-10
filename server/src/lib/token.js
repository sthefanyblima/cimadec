// Geração e leitura do JWT usado na sessão em cookie.
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Nome do cookie httpOnly que guarda a sessão.
export const SESSION_COOKIE = "cimadec_token";

export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

// Opções do cookie de sessão.
// - httpOnly: JS do navegador não lê o cookie (protege contra XSS roubar o token).
// - sameSite lax: mitiga CSRF em navegação normal.
// - secure só em produção (exige HTTPS); em dev fica false para funcionar em http://localhost.
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.isProd,
  maxAge: 24 * 60 * 60 * 1000, // 1 dia
  path: "/",
};
