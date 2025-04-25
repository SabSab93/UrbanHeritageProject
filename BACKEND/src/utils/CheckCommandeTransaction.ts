import { PrismaClient, taille_maillot_enum } from "@prisma/client";

const prisma = new PrismaClient();

interface LigneCommandeInput {
  id_stock: number;
  id_maillot: number;
  taille_maillot: taille_maillot_enum;
  quantite: number;
  prix_ht: number;
}

interface LivraisonInput {
  id_methode_livraison: number;
  id_lieu_livraison: number;
  id_livreur: number;
  adresse_livraison?: string;
  code_postal_livraison?: string;
  ville_livraison?: string;
  pays_livraison?: string;
  date_livraison?: Date | string;
}

export const checkCommandeTransaction = async (
  id_client: number,
  lignes: LigneCommandeInput[],
  livraison: LivraisonInput
) => {
  return await prisma.$transaction(async (tx) => {
    // Vérification stock
    for (const ligne of lignes) {
      const mouvements = await tx.stockMaillot.findMany({
        where: { id_stock: ligne.id_stock },
      });

      const totalEntree = mouvements.filter(m => m.type_mouvement === "entree").reduce((acc, m) => acc + m.quantite_stock, 0);
      const totalSortie = mouvements.filter(m => m.type_mouvement === "sortie").reduce((acc, m) => acc + m.quantite_stock, 0);

      const dispo = totalEntree - totalSortie;
      if (ligne.quantite > dispo) {
        throw new Error(`Stock insuffisant pour l'article (id_stock: ${ligne.id_stock})`);
      }
    }

    // 💰 Calcul total HT
    let totalHT = lignes.reduce((acc, l) => acc + l.quantite * l.prix_ht, 0);

    // 💸 Prix livraison (methode + lieu)
    const methode = await tx.methodeLivraison.findUnique({ where: { id_methode_livraison: livraison.id_methode_livraison } });
    const lieu = await tx.lieuLivraison.findUnique({ where: { id_lieu_livraison: livraison.id_lieu_livraison } });

    const prixLivraison = (methode?.prix_methode || 0) + (lieu?.prix_lieu || 0);

    // TVA par défaut (id_tva = 1)
    const tva = await tx.tVA.findUnique({ where: { id_tva: 1 } });
    const tauxTVA = tva?.taux_tva || 0;

    // 🧾 Calcul montant total TTC
    const montant_total_ttc = Math.round(
      (totalHT + prixLivraison) * (1 + tauxTVA / 100)
    );

    // Création commande avec montant TTC
    const commande = await tx.commande.create({
      data: {
        id_client,
        date_commande: new Date(),
        statut_commande: "en_cours",
        statut_paiement: "en_attente",
        montant_total_ttc,
      },
    });

    // Création livraison
    await tx.livraison.create({
      data: {
        id_commande: commande.id_commande,
        id_methode_livraison: livraison.id_methode_livraison,
        id_lieu_livraison: livraison.id_lieu_livraison,
        id_livreur: livraison.id_livreur,
        date_livraison: livraison.date_livraison ? new Date(livraison.date_livraison) : null,
        adresse_livraison: livraison.adresse_livraison || "",
        code_postal_livraison: livraison.code_postal_livraison || null,
        ville_livraison: livraison.ville_livraison || "",
        pays_livraison: livraison.pays_livraison || "",
      },
    });

    // Création lignes
    for (const ligne of lignes) {
      await tx.ligneCommande.create({
        data: {
          id_commande: commande.id_commande,
          id_maillot: ligne.id_maillot,
          id_client,
          taille_maillot: ligne.taille_maillot,
          quantite: ligne.quantite,
          prix_ht: ligne.prix_ht,
        },
      });
    }

    return commande;
  });
};
