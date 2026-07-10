// Rotas do fluxo principal (ocorrências). Todas privadas: exigem sessão.
import { Router } from "express";
import { create, list, getById, update, remove } from "../controllers/ocorrencia.controller.js";
import { requireAuth } from "../middlewares/auth.js";

export const ocorrenciaRoutes = Router();

// requireAuth aplicado a todas as rotas deste router.
ocorrenciaRoutes.use(requireAuth);

ocorrenciaRoutes.post("/", create);
ocorrenciaRoutes.get("/", list);
ocorrenciaRoutes.get("/:id", getById);
ocorrenciaRoutes.put("/:id", update);
ocorrenciaRoutes.delete("/:id", remove);
