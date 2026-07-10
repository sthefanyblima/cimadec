// Rotas de autenticação.
import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

export const authRoutes = Router();

authRoutes.post("/register", register); // público
authRoutes.post("/login", login); // público
authRoutes.post("/logout", logout); // público
authRoutes.get("/me", requireAuth, me); // privada
