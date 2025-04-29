import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function findOrCreateUser(data: {
  email: string;
  googleSub: string;
  name?: string;
}) {
  // 1. Compte déjà créé via Google
  let client = await prisma.client.findUnique({
    where: { google_sub: data.googleSub },
  });
  if (client) return client;

  // 2. Compte LOCAL existant avec même email → fusion (optionnel)
  client = await prisma.client.findUnique({
    where: { adresse_mail_client: data.email },
  });
  if (client) {
    return prisma.client.update({
      where: { id_client: client.id_client },
      data: { provider: "google", google_sub: data.googleSub },
    });
  }

  // 3. Nouveau client
  return prisma.client.create({
    data: {
      provider: "google",
      google_sub: data.googleSub,
      adresse_mail_client: data.email,
      nom_client: data.name?.split(" ").slice(-1).join(" ") ?? "",
      prenom_client: data.name?.split(" ").slice(0, -1).join(" ") ?? "",
      // rôles par défaut (client) + autres champs obligatoires selon ton schéma
      adresse_client: "",
      code_postal_client: "",
      ville_client: "",
      pays_client: "France",
    },
  });
}
