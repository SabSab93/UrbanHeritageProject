import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { isAdmin } from "../../middleware/isAdmin";
import { sendMailWithAttachment } from "../utils/mailService"; // 👈 utiliser sendMailWithAttachment
import { templateAvoirCreation } from "../templateMails/avoir/avoirCreation";
import { generateAvoirPDF } from "../utils/generateAvoirPDF";

export const avoirRouter = Router();
const prisma = new PrismaClient();

// ✅ POST - Créer un avoir (admin après retour réceptionné)
avoirRouter.post("/create", isAdmin, async (req, res) => {
  const { id_commande_retour } = req.body.data;

  if (!id_commande_retour) {
    return res.status(400).json({ message: "ID commande retour requis." });
  }

  try {
    const commande = await prisma.commande.findUnique({
      where: { id_commande: id_commande_retour },
      include: {
        Client: true,
        LigneCommande: {
          include: { Maillot: true }
        }
      },
    });

    if (!commande) return res.status(404).json({ message: "Commande non trouvée." });

    const numeroAvoir = `AVR-${id_commande_retour}-${Date.now()}`;

    const avoir = await prisma.avoir.create({
      data: {
        numero_avoir: numeroAvoir,
        date_avoir: new Date(),
        avoir_hors_ue: commande.Client.pays_client.toLowerCase() === "suisse",
      },
    });

    const avoirPDFData = {
      numeroAvoir: numeroAvoir,
      dateAvoir: new Date().toLocaleDateString("fr-FR"),
      client: {
        nom: commande.Client.nom_client,
        adresse: commande.Client.adresse_client,
        email: commande.Client.adresse_mail_client,
      },
      articles: commande.LigneCommande.map((ligne) => ({
        description: ligne.Maillot.nom_maillot,
        quantite: ligne.quantite,
        prixUnitaireHT: ligne.prix_ht.toNumber(),
        montantHT: ligne.quantite * ligne.prix_ht.toNumber(),
      })),
      totalHT: commande.LigneCommande.reduce((total, ligne) => total + (ligne.prix_ht.toNumber() * ligne.quantite), 0),
      tva: commande.Client.pays_client.toLowerCase() === "suisse" ? 0 : 20,
      totalTTC: commande.montant_total_ttc?.toNumber() || 0,
    };

    const pathPDF = await generateAvoirPDF(avoirPDFData);

    await sendMailWithAttachment({
      to: commande.Client.adresse_mail_client,
      subject: "💸 Votre avoir UrbanHeritage est disponible",
      html: templateAvoirCreation(commande.Client.prenom_client || commande.Client.nom_client, numeroAvoir),
      attachmentPath: pathPDF, // 👈 ICI on ajoute le PDF
    });

    return res.status(201).json({ message: "Avoir créé et email envoyé 🎁", avoir });

  } catch (error: any) {
    console.error("Erreur création avoir :", error);
    return res.status(500).json({ message: "Erreur serveur", details: error.message || error });
  }
});
