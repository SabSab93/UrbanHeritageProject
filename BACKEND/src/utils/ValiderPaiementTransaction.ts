import { PrismaClient } from "@prisma/client";
import { generateFacturePDF } from "./generateFacturePDF";
import { sendMail, sendMailWithAttachment } from "./mailService";
import { templateConfirmationCommande } from "../templateMails/commande/commandeConfirmation";
import { templateFactureEnvoyee } from "../templateMails/commande/envoiFacture";

const prisma = new PrismaClient();

export const validerPaiementTransaction = async (id_commande: number) => {
  return await prisma.$transaction(async (tx) => {
    // 1) Charger la commande et ses lignes
    const commande = await tx.commande.findUnique({
      where: { id_commande },
      include: { LigneCommande: true },
    });
    if (!commande) throw new Error("Commande introuvable");

    // 2) Vérifier et débiter le stock pour chaque ligne
    for (const ligne of commande.LigneCommande) {
      const stock = await tx.stock.findFirst({
        where: {
          id_maillot: ligne.id_maillot,
          taille_maillot: ligne.taille_maillot,
        },
      });
      if (!stock) {
        throw new Error(`Stock introuvable pour le maillot ${ligne.id_maillot}`);
      }
      const mouvements   = await tx.stockMaillot.findMany({ where: { id_stock: stock.id_stock } });
      const totalEntree  = mouvements.filter(m => m.type_mouvement === "entree").reduce((a, m) => a + m.quantite_stock, 0);
      const totalSortie  = mouvements.filter(m => m.type_mouvement === "sortie").reduce((a, m) => a + m.quantite_stock, 0);
      const dispo        = totalEntree - totalSortie;
      if (ligne.quantite > dispo) {
        throw new Error(`Stock insuffisant pour le maillot ${ligne.id_maillot}`);
      }
      await tx.stockMaillot.create({
        data: {
          id_stock: stock.id_stock,
          type_mouvement: "sortie",
          quantite_stock: ligne.quantite,
        },
      });
      await tx.maillot.update({
        where: { id_maillot: ligne.id_maillot },
        data: { quantite_vendue: { increment: ligne.quantite } },
      });
    }

    // 3) Mettre à jour le statut de la commande
    await tx.commande.update({
      where: { id_commande },
      data: {
        statut_commande: "en_cours_de_preparation",
        statut_paiement: "paye",
      },
    });

    // 4) Recharger la commande “complète” avec tous les détails nécessaires
    const commandeComplete = await tx.commande.findUnique({
      where: { id_commande },
      include: {
        Client: true,
        LigneCommande: {
          include: {
            Maillot: true,
            Personnalisation: true, // champ unique désormais
          },
        },
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison:    true,
            Livreur:          true,
          },
        },
        CommandeReduction: {
          include: { Reduction: true },
        },
      },
    });
    if (!commandeComplete) throw new Error("Impossible de charger la commande complète");

    // 5) Générer et enregistrer la facture
    const dateFacture = new Date();
    const numeroFacture = `FCT-${id_commande}-${Date.now()}`;
    const facture = await tx.facture.create({
      data: {
        numero_facture:   numeroFacture,
        id_commande,
        facture_hors_ue: commandeComplete.Client.pays_client.toLowerCase() === "suisse",
        date_facture:    dateFacture,
      },
    });

    // 6) Construire le détail des articles pour le PDF
    const articles = commandeComplete.LigneCommande.map(l => {
      const prixBase     = l.prix_ht.toNumber();
      const prixPerso    = l.Personnalisation?.prix_ht.toNumber() ?? 0;
      const prixUnitaire = prixBase + prixPerso;
      const montantHT    = prixUnitaire * l.quantite;

      return {
        description:               l.Maillot.nom_maillot,
        quantite:                  l.quantite,
        prixDeBase:                prixBase,
        totalPersonnalisations:    prixPerso,
        prixUnitaireHT:            prixUnitaire,
        montantHT,
        personnalisations: l.Personnalisation ? [{
          description: l.Personnalisation.type_personnalisation,
          prix       : l.Personnalisation.prix_ht.toNumber(),
          valeur     : l.valeur_personnalisation,
          couleur    : l.couleur_personnalisation,
        }] : [],
      };
    });

    // 7) Calcul des totaux et TVA
    const prixLivraison = (commandeComplete.Livraison[0]?.MethodeLivraison.prix_methode || 0)
                       + (commandeComplete.Livraison[0]?.LieuLivraison.prix_lieu || 0);
    const totalArticlesHT = articles.reduce((a, art) => a + art.montantHT, 0);
    const valeurReduction  = commandeComplete.CommandeReduction?.Reduction.valeur_reduction.toNumber() || 0;
    const totalHTBrut      = totalArticlesHT + prixLivraison;
    const totalHTApresRem  = totalHTBrut - valeurReduction;
    const tva              = facture.facture_hors_ue ? 0 : 20;
    const totalTTC         = totalHTApresRem * (1 + tva/100);

    // 8) Générer le PDF et envoyer les emails
    const pdfData = {
      numeroFacture:      facture.numero_facture,
      dateFacture:        dateFacture.toLocaleDateString("fr-FR"),
      client: {
        nom:    commandeComplete.Client.nom_client,
        adresse:commandeComplete.Client.adresse_client,
        email:  commandeComplete.Client.adresse_mail_client,
      },
      articles,
      totalHTBrut,
      reductionCommande:  valeurReduction,
      totalHT:            totalHTApresRem,
      tva,
      totalTTC,
      livraison: {
        methode: commandeComplete.Livraison[0]?.MethodeLivraison.nom_methode,
        lieu:    commandeComplete.Livraison[0]?.LieuLivraison.nom_lieu,
        livreur: commandeComplete.Livraison[0]?.Livreur.nom_livreur,
        prix:    prixLivraison,
      },
    };
    const pdfPath = await generateFacturePDF(pdfData);

    await sendMail({
      to:      commandeComplete.Client.adresse_mail_client,
      subject: "🎉 Confirmation de votre commande UrbanHeritage",
      html:    templateConfirmationCommande(
        commandeComplete.Client.prenom_client,
        commandeComplete.id_commande.toString()
      ),
    });
    await sendMailWithAttachment({
      to:             commandeComplete.Client.adresse_mail_client,
      subject:        "🧾 Votre facture UrbanHeritage",
      html:           templateFactureEnvoyee(commandeComplete.Client.prenom_client || commandeComplete.Client.nom_client),
      attachmentPath: pdfPath,
    });

    return { message: "Paiement validé, stock mis à jour, facture générée et email envoyé." };
  }, { timeout: 15000 });
};
