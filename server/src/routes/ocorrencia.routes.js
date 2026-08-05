// Rotas do fluxo principal (ocorrências).
import { Router } from "express";
import { create, list, getById, update, remove, listPublic } from "../controllers/ocorrencia.controller.js";
import { requireAuth } from "../middlewares/auth.js";

export const ocorrenciaRoutes = Router();

// Rota pública do mapa de incidentes — registrada ANTES do requireAuth.
ocorrenciaRoutes.get("/mapa", listPublic);

// A partir daqui, tudo exige sessão.
ocorrenciaRoutes.use(requireAuth);

ocorrenciaRoutes.post("/", create);
ocorrenciaRoutes.get("/", list);
ocorrenciaRoutes.get("/:id", getById);
ocorrenciaRoutes.put("/:id", update);
ocorrenciaRoutes.delete("/:id", remove);
