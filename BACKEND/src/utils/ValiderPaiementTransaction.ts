import { PrismaClient } from "@prisma/client";
import { generateFacturePDF } from "./generateFacturePDF";
import { sendMail, sendMailWithAttachment } from "./mailService";
import { templateConfirmationCommande } from "../templateMails/commande/commandeConfirmation";
import { templateFactureEnvoyee } from "../templateMails/commande/envoiFacture";

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

    // Update statut
    await tx.commande.update({
      where: { id_commande },
      data: {
        statut_commande: "en_cours_de_preparation",
        statut_paiement: "paye",
      },
    });

    const commandeComplete = await prisma.commande.findUnique({
      where: { id_commande },
      include: {
        Client: true,
        LigneCommande: {
          include: {
            Maillot: true,
            LigneCommandePersonnalisation: { include: { Personnalisation: true } },
          },
        },
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison: true,
            Livreur: true,
          },
        },
        CommandeReduction: {
          include: { Reduction: true },
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

    const articles = commandeComplete.LigneCommande.map((l) => {
      const prixBase = l.prix_ht.toNumber();
      const prixPersoTotal = l.LigneCommandePersonnalisation.reduce((acc, p) => acc + p.prix_personnalisation_ht.toNumber(), 0);
      const prixFinal = prixBase + prixPersoTotal;
      const montantHT = prixFinal * l.quantite;

      return {
        description: l.Maillot.nom_maillot,
        quantite: l.quantite,
        prixDeBase: prixBase,
        totalPersonnalisations: prixPersoTotal,
        prixUnitaireHT: prixFinal,
        montantHT: montantHT,
        personnalisations: l.LigneCommandePersonnalisation.map(p => ({
          description: p.Personnalisation.type_personnalisation,
          prix: p.prix_personnalisation_ht.toNumber(),
        })),
      };
    });

      // ----------------------- CALCULS TOTAUX -----------------------
      const prixLivraison = (commandeComplete.Livraison[0]?.MethodeLivraison.prix_methode || 0)
                          + (commandeComplete.Livraison[0]?.LieuLivraison.prix_lieu || 0);

      const totalArticlesHT = articles.reduce((acc, a) => acc + a.montantHT, 0);

      // réduction (si présente)
      const reductionCommande = commandeComplete.CommandeReduction?.Reduction;
      const valeurReductionCommande = reductionCommande ? reductionCommande.valeur_reduction.toNumber() : 0;

      // totaux
      const totalHTBrut      = totalArticlesHT + prixLivraison;
      const totalHTApresRem  = totalHTBrut - valeurReductionCommande;
      const tva              = facture.facture_hors_ue ? 0 : 20;
      const totalTTC         = totalHTApresRem * (1 + tva / 100);

      // ----------------------- PDF DATA -----------------------------
      const pdfData = {
        numeroFacture : facture.numero_facture,
        dateFacture   : dateFacture.toLocaleDateString("fr-FR"),
        client        : {
          nom    : commandeComplete.Client.nom_client,
          adresse: commandeComplete.Client.adresse_client,
          email  : commandeComplete.Client.adresse_mail_client,
        },
        articles,
        totalHTBrut            : totalHTBrut,
        reductionCommande      : valeurReductionCommande,
        totalHT                : totalHTApresRem,
        tva,
        totalTTC,
        livraison: {
          methode: commandeComplete.Livraison[0]?.MethodeLivraison.nom_methode,
          lieu   : commandeComplete.Livraison[0]?.LieuLivraison.nom_lieu,
          livreur: commandeComplete.Livraison[0]?.Livreur.nom_livreur,
          prix   : prixLivraison,
        },
      };

    const pdfPath = await generateFacturePDF(pdfData);
    await sendMail({
      to: commandeComplete.Client.adresse_mail_client,
      subject: "🎉 Confirmation de votre commande UrbanHeritage",
      html: templateConfirmationCommande(commandeComplete.Client.prenom_client, commandeComplete.id_commande.toString()),
    });

    console.log("🛠️ Données PDF générées pour la facture :", JSON.stringify(pdfData, null, 2));

    await sendMailWithAttachment({
      to: commandeComplete.Client.adresse_mail_client,
      subject: "🧾 Votre facture UrbanHeritage",
      html: templateFactureEnvoyee(
        commandeComplete.Client.prenom_client || commandeComplete.Client.nom_client
      ),
      attachmentPath: pdfPath,     
    });

    return {
      message:
        "Paiement validé, stock mis à jour, facture générée et email envoyé.",
    };
  }, { timeout: 15000 });
};
