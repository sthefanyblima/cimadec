// Schemas de validação das entradas de autenticação.
import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  // Limite superior porque o bcrypt trunca em 72 bytes silenciosamente.
  senha: z
    .string()
    .min(6, "Senha deve ter ao menos 6 caracteres.")
    .max(72, "Senha deve ter no máximo 72 caracteres."),
  // `role` NÃO é aceito no cadastro público: todo registro cria um CIDADAO.
  // Promover a OPERADOR é feito só via seed / rota administrativa (evita
  // escalonamento de privilégio — qualquer um mandaria role=OPERADOR).
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  senha: z.string().min(1, "Senha é obrigatória."),
});
