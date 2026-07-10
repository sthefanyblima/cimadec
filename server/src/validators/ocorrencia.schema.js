// Schemas de validação das ocorrências.
import { z } from "zod";

const CATEGORIAS = ["ENCHENTE", "DESLIZAMENTO", "LIXO", "QUEDA_ARVORE", "INFRAESTRUTURA", "OUTRO"];
const STATUS = ["RECEBIDO", "EM_ANALISE", "RESOLVIDO", "CRITICO"];

export const createOcorrenciaSchema = z.object({
  categoria: z.enum(CATEGORIAS),
  descricao: z.string().trim().min(5, "Descrição deve ter ao menos 5 caracteres."),
  endereco: z.string().trim().min(3, "Endereço é obrigatório."),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// No update todos os campos são opcionais (edição parcial), mas ao menos um deve vir.
export const updateOcorrenciaSchema = z
  .object({
    categoria: z.enum(CATEGORIAS).optional(),
    descricao: z.string().trim().min(5).optional(),
    endereco: z.string().trim().min(3).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    status: z.enum(STATUS).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizar.",
  });
