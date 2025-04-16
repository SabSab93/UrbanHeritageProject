/// <reference types="node" />

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tvaEntry = await prisma.tVA.create({
    data: {
      taux_tva: 20,
      description_tva: "TVA de 20%"
    }
  });
  console.log("TVA créée :", tvaEntry);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
