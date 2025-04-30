import { PrismaClient } from "@prisma/client";
import { creerAvoirDepuisRetour } from "./creerAvoirDepuisRetour";

const prisma = new PrismaClient();

// Cette fonction : réceptionne le retour + remet le stock + crée l'avoir !
export const gererReceptionRetour = async (id_commande_retour: number) => {
  const retour = await prisma.retour.findUnique({
    where: { id_commande_retour },
    include: {
      RetourLigneCommande: {
        include: {
          LigneCommande: true,
        },
      },
    },
  });

  if (!retour) {
    throw new Error("Retour non trouvé.");
  }

  if (retour.RetourLigneCommande.length === 0) {
    throw new Error("Aucune ligne associée à ce retour.");
  }

  for (const retourLigne of retour.RetourLigneCommande) {
    const ligneCommande = retourLigne.LigneCommande;

    const stock = await prisma.stock.findFirst({
      where: {
        id_maillot: ligneCommande.id_maillot,
        taille_maillot: ligneCommande.taille_maillot,
      },
    });

    if (!stock) {
      console.error(`Stock introuvable pour le maillot ${ligneCommande.id_maillot} (${ligneCommande.taille_maillot})`);
      continue;
    }

    await prisma.stockMaillot.create({
      data: {
        id_stock: stock.id_stock,
        type_mouvement: "entree",
        quantite_stock: ligneCommande.quantite,
      },
    });
  }

  // Met à jour reception_retour
  const retourReceptionne = await prisma.retour.update({
    where: { id_commande_retour },
    data: { reception_retour: true },
  });

  // Génère automatiquement l'avoir
  await creerAvoirDepuisRetour(id_commande_retour);

  return retourReceptionne;
};
