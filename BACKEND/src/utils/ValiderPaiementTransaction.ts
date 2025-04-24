import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validerPaiementTransaction = async (id_commande: number) => {
  return await prisma.$transaction(async (tx) => {
    // Récupération de la commande
    const commande = await tx.commande.findUnique({
      where: { id_commande },
      include: {
        LigneCommande: true,
      },
    });

    if (!commande) {
      throw new Error("Commande introuvable");
    }

    // Vérification du stock pour chaque ligne
    for (const ligne of commande.LigneCommande) {
      // Trouver le stock correspondant (maillot + taille)
      const stock = await tx.stock.findFirst({
        where: {
          id_maillot: ligne.id_maillot,
          taille_maillot: ligne.taille_maillot,
        },
      });

      if (!stock) {
        throw new Error(`Stock introuvable pour le maillot ${ligne.id_maillot} (${ligne.taille_maillot})`);
      }

      const mouvements = await tx.stockMaillot.findMany({
        where: { id_stock: stock.id_stock },
      });

      const totalEntree = mouvements
        .filter((m) => m.type_mouvement === "entree")
        .reduce((acc, m) => acc + m.quantite_stock, 0);

      const totalSortie = mouvements
        .filter((m) => m.type_mouvement === "sortie")
        .reduce((acc, m) => acc + m.quantite_stock, 0);

      const dispo = totalEntree - totalSortie;

      if (ligne.quantite > dispo) {
        throw new Error(
          `Stock insuffisant pour l'article (maillot: ${ligne.id_maillot}, taille: ${ligne.taille_maillot}). Disponible: ${dispo}, requis: ${ligne.quantite}`
        );
      }

      // MOUVEMENT DE STOCK (sortie)
      await tx.stockMaillot.create({
        data: {
          id_stock: stock.id_stock,
          type_mouvement: "sortie",
          quantite_stock: ligne.quantite,
        },
      });
    }

    // Mise à jour des statuts
    await tx.commande.update({
      where: { id_commande },
      data: {
        statut_commande: "livraison",
        statut_paiement: "paye",
      },
    });

    return { message: "Paiement validé et stock mis à jour avec succès." };
  });
};
