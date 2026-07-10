// Controller de autenticação: cadastro, login, logout e "quem sou eu".
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/http.js";
import { signToken, cookieOptions, SESSION_COOKIE } from "../lib/token.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";

// Remove o hash da senha antes de devolver o usuário na resposta.
function publicUser(user) {
  return { id: user.id, nome: user.nome, email: user.email, role: user.role, createdAt: user.createdAt };
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { nome, email, senha } = registerSchema.parse(req.body);

  const senhaHash = await bcrypt.hash(senha, 10);

  // Cadastro público sempre cria CIDADAO (role não vem do cliente).
  // Se o e-mail já existir, o Prisma lança P2002 -> tratado como 409 no errorHandler.
  const user = await prisma.user.create({
    data: { nome, email, senhaHash, role: "CIDADAO" },
  });

  res.status(201).json({ user: publicUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, senha } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  // Mensagem genérica: não revela se foi o e-mail ou a senha que falhou.
  if (!user || !(await bcrypt.compare(senha, user.senhaHash))) {
    throw new AppError(401, "Credenciais inválidas.");
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.cookie(SESSION_COOKIE, token, cookieOptions);
  res.json({ user: publicUser(user) });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Sessão encerrada." });
});

// GET /api/auth/me  (rota privada)
export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new AppError(404, "Usuário não encontrado.");
  res.json({ user: publicUser(user) });
});
