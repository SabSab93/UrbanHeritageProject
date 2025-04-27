import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";
import { sendMail } from "../utils/mailService";
import { templateBonRetour } from "../templateMails/retour/bonRetour";
import { gererReceptionRetour } from "../utils/gererReceptionRetour";

export const retourRouter = Router();
const prisma = new PrismaClient();

// ✅ POST - Demander un retour
retourRouter.post("/demander", monMiddlewareBearer, async (req: any, res) => {
  const { id_commande, motif_retour, lignes_retour } = req.body.data;
  const idClient = req.decoded.id_client;

  if (!id_commande || !motif_retour || !Array.isArray(lignes_retour) || lignes_retour.length === 0) {
    return res.status(400).json({ message: "Champs requis manquants ou lignes vides." });
  }

  try {
    const commande = await prisma.commande.findUnique({
      where: { id_commande },
      include: {
        Client: true,
        LigneCommande: {
          include: { LigneCommandePersonnalisation: true },
        },
      },
    });

    if (!commande) return res.status(404).json({ message: "Commande introuvable." });
    if (commande.id_client !== idClient) return res.status(403).json({ message: "Accès interdit." });

    // 🔥 Vérifie qu'il n'y a pas déjà un retour
    const lignesDejaRetournees = await prisma.retourLigneCommande.findMany({
      where: { id_lignecommande: { in: lignes_retour } },
    });

    if (lignesDejaRetournees.length > 0) {
      return res.status(400).json({
        message: "Certaines lignes ont déjà fait l'objet d'une demande de retour.",
        lignes: lignesDejaRetournees.map(lr => lr.id_lignecommande),
      });
    }

    // 🔥 Vérifie pas d'articles personnalisés
    const lignesAvecPerso = commande.LigneCommande.filter(lc =>
      lignes_retour.includes(lc.id_lignecommande) && lc.LigneCommandePersonnalisation.length > 0
    );

    if (lignesAvecPerso.length > 0) {
      return res.status(400).json({ message: "Retour interdit sur articles personnalisés." });
    }

    // ✅ Créer retour + lignes de retour
    const retour = await prisma.retour.create({
      data: {
        id_commande_retour: id_commande,
        motif_retour,
        date_retour: new Date(),
        droit_retour: true,
        reception_retour: false,
        RetourLigneCommande: {
          create: lignes_retour.map((id_lignecommande: number) => ({ id_lignecommande })),
        },
      },
    });

    // 📧 Envoi du mail bon de retour
    await sendMail({
      to: commande.Client.adresse_mail_client,
      subject: "📦 Bon de retour UrbanHeritage",
      html: templateBonRetour(commande.Client.prenom_client || commande.Client.nom_client, id_commande),
    });

    res.status(201).json({ message: "Demande de retour enregistrée.", retour });
  } catch (error: any) {
    console.error("Erreur demande retour :", error.message || error);
    res.status(500).json({ message: "Erreur serveur", details: error.message || error });
  }
});


// ✅ PUT - Confirmer réception du retour + stock + création avoir
retourRouter.put("/:id/reception", monMiddlewareBearer, isAdmin, async (req, res) => {
  const id_commande_retour = parseInt(req.params.id);

  if (isNaN(id_commande_retour)) {
    return res.status(400).json({ message: "ID invalide." });
  }

  try {
    // ➡️ Vérifier d'abord que le retour n'est pas déjà réceptionné
    const retour = await prisma.retour.findUnique({
      where: { id_commande_retour },
    });

    if (!retour) {
      return res.status(404).json({ message: "Retour introuvable." });
    }

    if (retour.reception_retour) {
      return res.status(400).json({ message: "Retour déjà réceptionné. Opération annulée." });
    }

    // ➡️ Appelle gererReceptionRetour (stock + avoir intégré)
    const retourReceptionne = await gererReceptionRetour(id_commande_retour);

    res.status(200).json({ 
      message: "Retour réceptionné, stock mis à jour et avoir généré 🎉", 
      retour: retourReceptionne 
    });

  } catch (error: any) {
    console.error("Erreur réception retour :", error.message || error);
    res.status(500).json({ message: "Erreur serveur", details: error.message || error });
  }
});
