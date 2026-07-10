// Popula o banco com dados de exemplo para demonstração.
// Rode com: npm run seed
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const senhaHash = await bcrypt.hash("123456", 10);

  const operador = await prisma.user.upsert({
    where: { email: "operador@cimadec.gov.br" },
    update: {},
    create: { nome: "Defesa Civil", email: "operador@cimadec.gov.br", senhaHash, role: "OPERADOR" },
  });

  const cidadao = await prisma.user.upsert({
    where: { email: "cidadao@exemplo.com" },
    update: {},
    create: { nome: "Maria Cidadã", email: "cidadao@exemplo.com", senhaHash, role: "CIDADAO" },
  });

  // Uma ocorrência de exemplo do cidadão.
  const jaExiste = await prisma.ocorrencia.findFirst({ where: { autorId: cidadao.id } });
  if (!jaExiste) {
    await prisma.ocorrencia.create({
      data: {
        categoria: "ENCHENTE",
        descricao: "Alagamento na Av. Fernandes Lima após chuva forte.",
        endereco: "Av. Fernandes Lima, Maceió - AL",
        latitude: -9.6498,
        longitude: -35.7089,
        status: "EM_ANALISE",
        autorId: cidadao.id,
      },
    });
  }

  console.log("Seed concluído.");
  console.log("Operador: operador@cimadec.gov.br / 123456");
  console.log("Cidadão:  cidadao@exemplo.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
