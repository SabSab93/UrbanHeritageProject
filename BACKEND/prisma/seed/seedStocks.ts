// prisma/seed/seedStocks.ts

import { PrismaClient, taille_maillot_enum, type_mouvement_enum } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedStocks() {
  console.log("🛠️  Seeding stocks…");

  // 1) Définis les maillots et les tailles à initialiser
  const maillotIds = [1, 2, 3];
  const tailles = ["S", "M", "L", "XL"] as taille_maillot_enum[];

  // 2) Création des stocks (skipDuplicates pour sécuriser les reruns)
  await prisma.stock.createMany({
    data: maillotIds.flatMap((id_maillot) =>
      tailles.map((taille_maillot) => ({
        id_maillot,
        taille_maillot,
      }))
    ),
    skipDuplicates: true,
  });

  // 3) Récupère tous les stocks créés pour ces maillots
  const stocks = await prisma.stock.findMany({
    where: { id_maillot: { in: maillotIds } },
    select: { id_stock: true },
  });

  // 4) Ajout d’un mouvement d’entrée de 20 unités pour chacun
  await prisma.stockMaillot.createMany({
    data: stocks.map(({ id_stock }) => ({
      id_stock,
      quantite_stock: 20,
      type_mouvement: type_mouvement_enum.entree,
    })),
    skipDuplicates: true,
  });

  console.log("✅  Stocks et mouvements seedés avec succès");
  await prisma.$disconnect();
}
