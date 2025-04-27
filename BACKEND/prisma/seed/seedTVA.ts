import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const seedTVA = async () => {
  console.log("Seeding TVA...");
  await prisma.tVA.createMany({
    data: [
      { taux_tva: 20, description_tva: "TVA France 20%" },
      { taux_tva: 0, description_tva: "TVA Suisse 0%" },
    ],
    skipDuplicates: true,
  });
};
