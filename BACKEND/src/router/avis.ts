import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";

export const avisRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre d’URL en entier positif. */
const parseId = (raw: any): number => {
  const parsed = parseInt(raw as string, 10);
  if (Number.isNaN(parsed) || parsed <= 0) throw new Error("ID invalide");
  return parsed;
};

/*** Lecture standard *********************************************************/
// Tous les avis
avisRouter.get("/", monMiddlewareBearer,isAdmin, async (_req, res) => {
  const allReviews = await prisma.avis.findMany();
  res.json(allReviews);
});

// Avis par ID
avisRouter.get("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const review = await prisma.avis.findUnique({ where: { id_avis: id } });
    if (!review)
      return res.status(404).json({ message: "Avis non trouvé" });
    res.json(review);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

// Tous les avis d’un maillot
avisRouter.get("/maillot/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const reviews = await prisma.avis.findMany({
      where: { id_maillot: id },
      include: { Client: true },
    });
    res.json(reviews);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création d’un avis (client connecté) ************************************/
avisRouter.post("/create", monMiddlewareBearer, async (req: any, res) => {
  const reviewData = req.body?.data;

  const requiredFields = [
    "id_client",
    "id_maillot",
    "classement_avis",
    "titre_avis",
    "description_avis",
  ];
  const missingFields = requiredFields.filter(
    (field) => !reviewData?.[field] && reviewData?.[field] !== 0
  );
  if (missingFields.length)
    return res.status(400).json({
      message: `Champs manquants : ${missingFields.join(", ")}`,
    });

  try {
    // Vérifie que le client a bien reçu ce maillot (commande livrée)
    const deliveredLine = await prisma.ligneCommande.findFirst({
      where: {
        id_client: reviewData.id_client,
        id_maillot: reviewData.id_maillot,
        Commande: { statut_commande: "livre" },
      },
    });
    if (!deliveredLine)
      return res.status(403).json({
        message: "Vous devez avoir reçu ce maillot pour laisser un avis.",
      });

    // Vérifie qu’un avis n’existe pas déjà
    const existingReview = await prisma.avis.findFirst({
      where: {
        id_client: reviewData.id_client,
        id_maillot: reviewData.id_maillot,
      },
    });
    if (existingReview)
      return res
        .status(409)
        .json({ message: "Vous avez déjà laissé un avis pour ce maillot." });

    // Création de l’avis
    const newReview = await prisma.avis.create({
      data: {
        id_maillot: reviewData.id_maillot,
        id_client: reviewData.id_client,
        classement_avis: reviewData.classement_avis,
        titre_avis: reviewData.titre_avis,
        description_avis: reviewData.description_avis,
        date_avis: new Date(),
      },
    });

    res.status(201).json({ message: "Merci pour votre avis 🎉", avis: newReview });
  } catch (error) {
    console.error("Erreur création avis :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Suppression d’un avis (client connecté) *********************************/
avisRouter.delete("/:id", monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    await prisma.avis.delete({ where: { id_avis: id } });
    res.json({ message: "Avis supprimé" });
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Statistiques d’avis pour un maillot *************************************/
avisRouter.get("/maillot/:id/stats", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const reviews = await prisma.avis.findMany({
      where: { id_maillot: id },
      include: { Client: true },
    });
    if (reviews.length === 0)
      return res.status(404).json({ message: "Aucun avis pour ce maillot" });

    const totalScore = reviews.reduce((sum, r) => sum + r.classement_avis, 0);
    const average = Number(totalScore / reviews.length).toFixed(1);

    res.json({ nombreAvis: reviews.length, noteMoyenne: average, avis: reviews });
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});