import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";

export const retourLigneCommandeRouter = Router();
const prisma = new PrismaClient();

/*** Création ***************************************************************/

// Création : ajouter une ligne de commande à un retour
retourLigneCommandeRouter.post("/create", monMiddlewareBearer, async (req: any, res) => {
  const { id_retour, id_lignecommande } = req.body.data;
  const idClient = req.decoded.id_client;

  if (!id_retour || !id_lignecommande) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  try {
    // Vérification que la ligne de commande appartient bien au client
    const ligne = await prisma.ligneCommande.findUnique({
      where: { id_lignecommande },
    });

    if (!ligne)
      return res.status(404).json({ message: "Ligne de commande introuvable." });
    if (ligne.id_client !== idClient)
      return res.status(403).json({ message: "Accès interdit à cette ligne de commande." });

    const retourLigne = await prisma.retourLigneCommande.create({
      data: {
        id_retour,
        id_lignecommande,
      },
    });

    res.status(201).json({ message: "Ligne ajoutée au retour avec succès.", retourLigne });
  } catch (error: any) {
    console.error("Erreur ajout ligne au retour :", error);
    res.status(500).json({ message: "Erreur serveur", details: error.message || error });
  }
});
