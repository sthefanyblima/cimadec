// Utilitários de HTTP compartilhados pelos controllers.

// Erro de aplicação com status HTTP embutido. Lançar `new AppError(404, "...")`
// em qualquer camada; o middleware central de erro traduz para a resposta.
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// Envolve um controller async para que qualquer erro/rejeição caia
// automaticamente no middleware de erro (sem try/catch repetido em toda rota).
export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
