import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const seedPersonnalisations = async () => {
  console.log("Seeding personnalisation...");
  await prisma.personnalisation.createMany({
    skipDuplicates: true,
    data: [
      {
        type_personnalisation: "name_color",
        prix_ht: 15,
        description: "Ajout d’un nom et d’une couleur",
      },
      {
        type_personnalisation: "name",
        prix_ht: 10,
        description: "Ajout d’un nom",
      },
    ],
  });
};
