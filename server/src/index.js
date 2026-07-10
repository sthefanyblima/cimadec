// Ponto de entrada: sobe o servidor HTTP.
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`CIMADEC API rodando em http://localhost:${env.port} (${env.nodeEnv})`);
});

// Encerra conexões com o banco ao derrubar o processo (Ctrl+C / kill).
async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
