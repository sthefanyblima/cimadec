// Centraliza a leitura das variáveis de ambiente e valida as obrigatórias.
// Falhar cedo aqui é melhor do que quebrar no meio de uma requisição.
import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. ` +
        `Copie server/.env.example para server/.env e preencha os valores.`
    );
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5500",
  get isProd() {
    return this.nodeEnv === "production";
  },
};
