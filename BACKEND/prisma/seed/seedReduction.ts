import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const seedReduction = async () => {
  console.log("Seeding reductions...");
  await prisma.reduction.createMany({
    data: [
      {
        code_reduction: "SPRING15",
        description: "15% de réduction spéciale printemps",
        valeur_reduction: 15.0,
        date_debut_reduction: new Date("2025-04-30"),
        date_fin_reduction: new Date("2025-06-30"),
        type_reduction: "pourcentage",
        statut_reduction: "active",
      },
    ],
    skipDuplicates: true,
  });
};
