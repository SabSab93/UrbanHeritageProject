// prisma/seed/seedLivreurs.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const seedLivreurs = async () => {
  console.log("Seeding livreurs...");
  await prisma.livreur.createMany({
    data: [
      { nom_livreur: "UPS" },
      { nom_livreur: "Chronopost" },
    ],
    skipDuplicates: true,
  });
};
