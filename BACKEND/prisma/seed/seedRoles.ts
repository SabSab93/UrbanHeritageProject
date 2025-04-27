import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const seedRoles = async () => {
  console.log("Seeding roles...");
  await prisma.role.createMany({
    data: [
      { nom_role: "admin", description: "Administrateur du site" },
      { nom_role: "client", description: "Client standard" },
    ],
    skipDuplicates: true,
  });
};
