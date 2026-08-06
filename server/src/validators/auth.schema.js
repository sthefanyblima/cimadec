// Schemas de validação das entradas de autenticação.
import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  // Política: 8+ caracteres, com ao menos uma letra e um número.
  // Máximo 72 porque o bcrypt trunca silenciosamente acima disso.
  senha: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres.")
    .max(72, "Senha deve ter no máximo 72 caracteres.")
    .regex(/[A-Za-z]/, "Senha deve conter ao menos uma letra.")
    .regex(/[0-9]/, "Senha deve conter ao menos um número."),
  // `role` NÃO é aceito no cadastro público: todo registro cria um CIDADAO.
  // Promover a OPERADOR é feito só via seed / rota administrativa (evita
  // escalonamento de privilégio — qualquer um mandaria role=OPERADOR).
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  senha: z.string().min(1, "Senha é obrigatória."),
});
