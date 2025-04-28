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
  livraison: {
    id_methode_livraison: number;
    id_lieu_livraison:   number;
    id_livreur:          number;
    adresse_livraison?:  string;
    code_postal_livraison?: string;
    ville_livraison?:    string;
    pays_livraison?:     string;
    date_livraison?:     Date | string;
  }
) => {
  return prisma.$transaction(async (tx) => {
    /* 1️⃣ récupérer les lignes du panier */
    const lignesPanier = await tx.ligneCommande.findMany({
      where: { id_client, id_commande: null },
    });

    if (lignesPanier.length === 0)
      throw new Error("Panier vide : aucune ligne à commander.");

    /* 2️⃣ vérification stock pour chacune */
    for (const l of lignesPanier) {
      const stock = await tx.stock.findFirst({
        where: { id_maillot: l.id_maillot, taille_maillot: l.taille_maillot },
      });
      if (!stock) throw new Error("Stock introuvable pour la ligne " + l.id_lignecommande);

      const mouvements = await tx.stockMaillot.findMany({ where: { id_stock: stock.id_stock } });
      const dispo = mouvements
        .filter(m => m.type_mouvement === "entree")
        .reduce((a, m) => a + m.quantite_stock, 0)
        - mouvements
        .filter(m => m.type_mouvement === "sortie")
        .reduce((a, m) => a + m.quantite_stock, 0);

      if (l.quantite > dispo) throw new Error("Stock insuffisant pour la ligne " + l.id_lignecommande);
    }

    /* 3️⃣ calculs totals */
    const totalHT = lignesPanier.reduce((acc, l) => acc + l.quantite * Number(l.prix_ht), 0);

    const methode = await tx.methodeLivraison.findUnique({ where: { id_methode_livraison: livraison.id_methode_livraison } });
    const lieu    = await tx.lieuLivraison.findUnique({ where: { id_lieu_livraison:   livraison.id_lieu_livraison   } });
    const prixLiv = (methode?.prix_methode || 0) + (lieu?.prix_lieu || 0);

    const tauxTVA = (await tx.tVA.findUnique({ where: { id_tva: 1 } }))?.taux_tva || 0;
    const montant_total_ttc = Math.round((totalHT + prixLiv) * (1 + tauxTVA / 100));

    /* 4️⃣ création commande */
    const commande = await tx.commande.create({
      data: {
        id_client,
        date_commande: new Date(),
        statut_commande: "en_cours",
        statut_paiement: "en_attente",
        montant_total_ttc,
      },
    });

    /* 5️⃣ rattacher les lignes existantes */
    await tx.ligneCommande.updateMany({
      where: { id_client, id_commande: null },
      data : { id_commande: commande.id_commande },
    });

    /* 6️⃣ créer livraison */
    await tx.livraison.create({
      data: {
        id_commande: commande.id_commande,
        ...livraison,
        date_livraison: livraison.date_livraison ? new Date(livraison.date_livraison) : null,
      },
    });

    return commande;
  }, { timeout: 15000 });
};
