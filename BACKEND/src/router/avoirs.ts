import { Router } from "express"; 
import { PrismaClient } from "@prisma/client";
import { isAdmin } from "../../middleware/isAdmin";
import { creerAvoirDepuisRetour } from "../utils/creerAvoirDepuisRetour";

export const avoirRouter = Router();
const prisma = new PrismaClient();


avoirRouter.post("/create", isAdmin, async (req, res) => {
  const { id_commande_retour } = req.body.data;

  if (!id_commande_retour) return res.status(400).json({ message: "ID commande retour requis." });

  try {
    const avoir = await creerAvoirDepuisRetour(id_commande_retour);

    res.status(201).json({ message: "Avoir créé et email envoyé 🎁", avoir });
  } catch (error: any) {
    console.error("Erreur création avoir :", error);
    res.status(500).json({ message: "Erreur serveur", details: error.message || error });
  }
});
// ✅ GET - Liste de tous les avoirs
avoirRouter.get("/", isAdmin, async (req, res) => {
  try {
    const avoirs = await prisma.avoir.findMany({
      orderBy: { date_avoir: "desc" },
    });

    res.json(avoirs);
  } catch (error) {
    console.error("Erreur récupération avoirs :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});