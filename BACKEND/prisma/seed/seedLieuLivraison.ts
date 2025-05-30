import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const seedLieuLivraison = async () => {
  console.log("Seeding lieux de livraison...");
  await prisma.lieuLivraison.createMany({
    data: [
      {
        nom_lieu: "Point Relais",
        prix_lieu: 4,
      },
      {
        nom_lieu: "Domicile",
        prix_lieu: 2,
      },
    ],
    skipDuplicates: true,
  });
};
