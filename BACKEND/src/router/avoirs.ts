import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isAdmin } from "../middleware/isAdmin";
import { creerAvoirDepuisRetour } from "../utils/creerAvoirDepuisRetour";
import { monMiddlewareBearer } from "../middleware/checkToken";

export const avoirRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Vérifie qu’un identifiant est bien un entier positif. */
const assertPositiveInt = (value: any, fieldName = "ID") => {
  const parsed = parseInt(value as string, 10);
  if (Number.isNaN(parsed) || parsed <= 0)
    throw new Error(`${fieldName} invalide`);
  return parsed;
};

/*** 1. Création d’un avoir (Admin) *******************************************/
avoirRouter.post("/create", async (req: Request, res: Response) => {
  const { id_commande_retour } = req.body?.data || {};
  if (!id_commande_retour)
    return res.status(400).json({ message: "id_commande_retour requis" });

  try {
    const idRetour = assertPositiveInt(id_commande_retour, "id_commande_retour");
    const newAvoir = await creerAvoirDepuisRetour(idRetour);
    res.status(201).json({ message: "Avoir créé et e‑mail envoyé", avoir: newAvoir });
  } catch (error: any) {
    const status = error.message?.includes("invalide") ? 400 : 500;
    console.error("POST /avoir/create", error);
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** 2. Liste des avoirs (Admin) **********************************************/
avoirRouter.get("/", async (_req, res) => {
  try {
    const allAvoirs = await prisma.avoir.findMany({ orderBy: { date_avoir: "desc" } });
    res.json(allAvoirs);
  } catch (error) {
    console.error("GET /avoir", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
