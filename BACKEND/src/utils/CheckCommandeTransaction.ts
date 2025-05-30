
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LivraisonInput {
  id_methode_livraison: number;
  id_lieu_livraison:   number;
  id_livreur:          number;
  adresse_livraison?:  string;
  code_postal_livraison?: string;
  ville_livraison?:    string;
  pays_livraison?:     string;
  date_livraison?:     Date | string;
}

export const checkCommandeTransaction = async (
  id_client: number,
  livraison: LivraisonInput
) => {
  return prisma.$transaction(
    async (tx) => {

      const lignesPanier = await tx.ligneCommande.findMany({
        where: { id_client, id_commande: null },
      });
      if (lignesPanier.length === 0)
        throw new Error("Panier vide : aucune ligne à commander.");


      for (const l of lignesPanier) {
        const stock = await tx.stock.findFirst({
          where: { id_maillot: l.id_maillot, taille_maillot: l.taille_maillot },
        });
        if (!stock)
          throw new Error(
            "Stock introuvable pour la ligne " + l.id_lignecommande
          );

        const mouvements = await tx.stockMaillot.findMany({
          where: { id_stock: stock.id_stock },
        });
        const dispo =
          mouvements
            .filter((m) => m.type_mouvement === "entree")
            .reduce((a, m) => a + m.quantite_stock, 0) -
          mouvements
            .filter((m) => m.type_mouvement === "sortie")
            .reduce((a, m) => a + m.quantite_stock, 0);

        if (l.quantite > dispo)
          throw new Error(
            "Stock insuffisant pour la ligne " + l.id_lignecommande
          );
      }

 
      const totalHT = lignesPanier.reduce(
        (acc, l) => acc + l.quantite * Number(l.prix_ht),
        0
      );
      const methode = await tx.methodeLivraison.findUnique({
        where: { id_methode_livraison: livraison.id_methode_livraison },
      });
      const lieu = await tx.lieuLivraison.findUnique({
        where: { id_lieu_livraison: livraison.id_lieu_livraison },
      });
      const prixLiv = (methode?.prix_methode || 0) + (lieu?.prix_lieu || 0);
      const tauxTVA =
        (await tx.tVA.findUnique({ where: { id_tva: 1 } }))?.taux_tva ||
        0;
      const montant_total_ttc = Math.round(
        (totalHT + prixLiv) * (1 + tauxTVA / 100)
      );

      const commande = await tx.commande.create({
        data: {
          id_client,
          date_commande: new Date(),
          statut_commande: "en_cours",
          statut_paiement: "en_attente",
          montant_total_ttc,
        },
      });


      await tx.ligneCommande.updateMany({
        where: { id_client, id_commande: null },
        data: { id_commande: commande.id_commande },
      });


      const {
        id_methode_livraison,
        id_lieu_livraison,
        id_livreur,
        adresse_livraison,
        code_postal_livraison,
        ville_livraison,
        pays_livraison,
        date_livraison,
      } = livraison;

      const livData: any = {
        id_commande: commande.id_commande,
        id_methode_livraison,
        id_lieu_livraison,
        id_livreur,
        date_livraison: date_livraison
          ? new Date(date_livraison)
          : null,
      };

      if (adresse_livraison) {
        livData.adresse_livraison = adresse_livraison;
        livData.code_postal_livraison = code_postal_livraison;
        livData.ville_livraison = ville_livraison;
        livData.pays_livraison = pays_livraison;
      }


      await tx.livraison.create({
        data: livData,
      });

      return commande;
    },
    { timeout: 15000 }
  );
};
