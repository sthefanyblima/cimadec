// Controller do fluxo principal: CRUD de ocorrências.
// Regras de acesso mínimas (não é RBAC completo):
//  - OPERADOR enxerga/edita/remove qualquer ocorrência (monitoramento);
//  - CIDADAO só acessa as próprias.
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/http.js";
import { createOcorrenciaSchema, updateOcorrenciaSchema } from "../validators/ocorrencia.schema.js";

// Busca a ocorrência e garante que o usuário tem permissão de acessá-la.
async function findAuthorized(id, user) {
  const ocorrencia = await prisma.ocorrencia.findUnique({ where: { id } });
  if (!ocorrencia) throw new AppError(404, "Ocorrência não encontrada.");

  const isDono = ocorrencia.autorId === user.id;
  const isOperador = user.role === "OPERADOR";
  if (!isDono && !isOperador) {
    throw new AppError(403, "Você não tem permissão para acessar esta ocorrência.");
  }
  return ocorrencia;
}

// GET /api/ocorrencias/mapa  (PÚBLICO)
// Alimenta o mapa de incidentes e o "radar de entorno" do cidadão.
// Não expõe autor nem a descrição (texto livre, pode conter dado pessoal) —
// só o necessário para localizar e classificar a ocorrência no mapa.
export const listPublic = asyncHandler(async (_req, res) => {
  const ocorrencias = await prisma.ocorrencia.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      categoria: true,
      endereco: true,
      latitude: true,
      longitude: true,
      status: true,
      createdAt: true,
    },
  });
  res.json({ total: ocorrencias.length, ocorrencias });
});

// POST /api/ocorrencias
export const create = asyncHandler(async (req, res) => {
  const data = createOcorrenciaSchema.parse(req.body);
  const ocorrencia = await prisma.ocorrencia.create({
    data: { ...data, autorId: req.user.id },
  });
  res.status(201).json({ ocorrencia });
});

// GET /api/ocorrencias
// Operador vê todas; cidadão vê só as suas.
export const list = asyncHandler(async (req, res) => {
  const where = req.user.role === "OPERADOR" ? {} : { autorId: req.user.id };
  const ocorrencias = await prisma.ocorrencia.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json({ total: ocorrencias.length, ocorrencias });
});

// GET /api/ocorrencias/:id
export const getById = asyncHandler(async (req, res) => {
  await findAuthorized(req.params.id, req.user);
  const ocorrencia = await prisma.ocorrencia.findUnique({
    where: { id: req.params.id },
  });
  res.json({ ocorrencia });
});

// PUT /api/ocorrencias/:id
export const update = asyncHandler(async (req, res) => {
  const data = updateOcorrenciaSchema.parse(req.body);
  await findAuthorized(req.params.id, req.user);

  // Só operador pode mudar o status (é o indicador do painel de monitoramento).
  // Cidadão editando a própria ocorrência não pode auto-resolver/marcar como crítica.
  if (data.status !== undefined && req.user.role !== "OPERADOR") {
    throw new AppError(403, "Apenas operadores podem alterar o status da ocorrência.");
  }

  const ocorrencia = await prisma.ocorrencia.update({
    where: { id: req.params.id },
    data,
  });
  res.json({ ocorrencia });
});

// DELETE /api/ocorrencias/:id
export const remove = asyncHandler(async (req, res) => {
  await findAuthorized(req.params.id, req.user);
  await prisma.ocorrencia.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
