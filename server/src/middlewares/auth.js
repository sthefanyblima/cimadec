// Middleware de autenticação: protege rotas privadas.
// Lê o JWT do cookie httpOnly, valida a assinatura e anexa o usuário em req.user.
import { AppError } from "../lib/http.js";
import { SESSION_COOKIE, verifyToken } from "../lib/token.js";

export function requireAuth(req, _res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    throw new AppError(401, "Não autenticado. Faça login para acessar este recurso.");
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    // Token expirado, adulterado ou assinado com outro segredo.
    throw new AppError(401, "Sessão inválida ou expirada. Faça login novamente.");
  }
}
