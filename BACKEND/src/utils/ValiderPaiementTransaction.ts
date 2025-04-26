import { PrismaClient } from "@prisma/client";
import { generateFacturePDF } from "./generateFacturePDF";
import { sendMailWithAttachment } from "./mailService";
import path from "path";

const prisma = new PrismaClient();

export const validerPaiementTransaction = async (id_commande: number) => {
  return await prisma.$transaction(async (tx) => {
    const commande = await tx.commande.findUnique({
      where: { id_commande },
      include: {
        LigneCommande: true,
      },
    });

    if (!commande) {
      throw new Error("Commande introuvable");
    }

    // Vérification du stock
    for (const ligne of commande.LigneCommande) {
      const stock = await tx.stock.findFirst({
        where: {
          id_maillot: ligne.id_maillot,
          taille_maillot: ligne.taille_maillot,
        },
      });

      if (!stock) {
        throw new Error(`Stock introuvable pour le maillot ${ligne.id_maillot} (${ligne.taille_maillot})`);
      }

      const mouvements = await tx.stockMaillot.findMany({ where: { id_stock: stock.id_stock } });
      const totalEntree = mouvements.filter(m => m.type_mouvement === "entree").reduce((acc, m) => acc + m.quantite_stock, 0);
      const totalSortie = mouvements.filter(m => m.type_mouvement === "sortie").reduce((acc, m) => acc + m.quantite_stock, 0);
      const dispo = totalEntree - totalSortie;

      if (ligne.quantite > dispo) {
        throw new Error(`Stock insuffisant pour le maillot ${ligne.id_maillot} (${ligne.taille_maillot})`);
      }

      await tx.stockMaillot.create({
        data: {
          id_stock: stock.id_stock,
          type_mouvement: "sortie",
          quantite_stock: ligne.quantite,
        },
      });
    }

    // ✅ Ici, uniquement le statut paiement !
    await tx.commande.update({
      where: { id_commande },
      data: {
        statut_commande: "en_cours_de_preparation",
        statut_paiement: "paye",
      },
    });

    // Génération facture
    const commandeComplete = await prisma.commande.findUnique({
      where: { id_commande },
      include: {
        Client: true,
        LigneCommande: { include: { Maillot: true } },
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison: true,
            Livreur: true,
          },
        },
      },
    });

    if (!commandeComplete) {
      throw new Error("Impossible de charger la commande complète");
    }

    const numero_facture = `FCT-${id_commande}-${Date.now()}`;
    const dateFacture = new Date();

    const facture = await prisma.facture.create({
      data: {
        numero_facture,
        id_commande,
        facture_hors_ue: commandeComplete.Client.pays_client.toLowerCase() === "suisse",
        date_facture: dateFacture,
      },
    });

    const pdfData = {
      numeroFacture: facture.numero_facture,
      dateFacture: dateFacture.toLocaleDateString("fr-FR"),
      client: {
        nom: commandeComplete.Client.nom_client,
        adresse: commandeComplete.Client.adresse_client,
        email: commandeComplete.Client.adresse_mail_client,
      },
      articles: commandeComplete.LigneCommande.map((l) => ({
        description: l.Maillot.nom_maillot,
        quantite: l.quantite,
        prixUnitaireHT: l.prix_ht.toNumber(),
        montantHT: l.quantite * l.prix_ht.toNumber(),
      })),
      totalHT: commandeComplete.LigneCommande.reduce((acc, l) => acc + l.quantite * l.prix_ht.toNumber(), 0),
      tva: facture.facture_hors_ue ? 0 : 20,
      totalTTC: commandeComplete.montant_total_ttc?.toNumber() || 0,
      livraison: {
        methode: commandeComplete.Livraison[0]?.MethodeLivraison.nom_methode,
        lieu: commandeComplete.Livraison[0]?.LieuLivraison.nom_lieu,
        livreur: commandeComplete.Livraison[0]?.Livreur.nom_livreur,
        prix:
          (commandeComplete.Livraison[0]?.MethodeLivraison.prix_methode || 0) +
          (commandeComplete.Livraison[0]?.LieuLivraison.prix_lieu || 0),
      },
    };

    const pdfPath = await generateFacturePDF(pdfData);

    await sendMailWithAttachment({
      to: commandeComplete.Client.adresse_mail_client,
      subject: "🎉 Merci pour votre commande chez UrbanHeritage !",
      text: `Bonjour ${commandeComplete.Client.prenom_client || commandeComplete.Client.nom_client},

Merci beaucoup pour votre commande sur UrbanHeritage ✨ !

Veuillez trouver en pièce jointe votre facture officielle.

Nous espérons que votre nouveau maillot vous plaira autant que nous avons aimé le créer ❤️.

À très bientôt sur UrbanHeritage !`,
      attachmentPath: pdfPath,
    });

    return { message: "Paiement validé, stock mis à jour, facture générée et email envoyé." };
  });
};
