// Cliente Prisma único (singleton) reutilizado por toda a aplicação.
// Evita abrir várias conexões com o banco — cada `new PrismaClient()`
// abre um pool novo.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
