import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";
import { sendMail } from "../utils/mailService";
import { templateBonRetour } from "../templateMails/retour/bonRetour";

export const retourRouter = Router();
const prisma = new PrismaClient();

// ✅ POST - Demander un retour (client)
retourRouter.post("/demander", monMiddlewareBearer, async (req: any, res) => {
  const { id_commande, motif_retour } = req.body.data;
  const idClient = req.decoded.id_client;

  if (!id_commande || !motif_retour) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  try {
    // Vérifier la commande
    const commande = await prisma.commande.findUnique({
      where: { id_commande },
      include: { 
        Client: true,
        LigneCommande: { include: { LigneCommandePersonnalisation: true } }
      },
    });

    if (!commande) return res.status(404).json({ message: "Commande introuvable." });
    if (commande.id_client !== idClient) return res.status(403).json({ message: "Accès interdit." });

    if (commande.LigneCommande.some(ligne => ligne.LigneCommandePersonnalisation.length > 0)) {
      return res.status(400).json({ message: "Retour non autorisé sur des articles personnalisés." });
    }

    // Créer l'entrée de retour
    await prisma.retour.create({
      data: {
        id_commande_retour: id_commande,
        motif_retour,
        date_retour: new Date(),
        droit_retour: true,
        reception_retour: false,
      },
    });

    // Envoyer le mail bon de retour
    await sendMail({
      to: commande.Client.adresse_mail_client,
      subject: "📦 Bon de retour UrbanHeritage",
      html: templateBonRetour(commande.Client.prenom_client || commande.Client.nom_client, id_commande),
    });

    return res.status(201).json({ message: "Demande de retour enregistrée et bon de retour envoyé par mail." });

  } catch (error: any) {
    console.error("Erreur demande retour :", error);
    return res.status(500).json({ message: "Erreur serveur", details: error.message || error });
  }
});

// ✅ PUT - Confirmer réception du retour (admin)
retourRouter.put("/:id/reception", monMiddlewareBearer, isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID invalide." });
  }

  try {
    const retour = await prisma.retour.update({
      where: { id_commande_retour: id },
      data: { reception_retour: true },
    });

    return res.json({ message: "Retour réceptionné avec succès 🚚", retour });

  } catch (error: any) {
    console.error("Erreur réception retour :", error);
    return res.status(500).json({ message: "Erreur serveur", details: error.message || error });
  }
});
