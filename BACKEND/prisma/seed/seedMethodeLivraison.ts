import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const seedMethodesLivraison = async () => {
  console.log("Seeding méthodes de livraison...");
  await prisma.methodeLivraison.createMany({
    data: [
      {
        nom_methode: "Livraison Rapide",
        prix_methode: 6,
      },
      {
        nom_methode: "Livraison Express",
        prix_methode: 8,
      },
      {
        nom_methode: "Livraison Classique",
        prix_methode: 4,
      },
    ],
    skipDuplicates: true,
  });
};
