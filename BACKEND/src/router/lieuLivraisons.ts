import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

export const lieuLivraisonRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
const parseId = (raw: any): number => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error("ID invalide");
  return id;
};

/*** Lecture : tous les lieux (public) **************************************/
lieuLivraisonRouter.get("/", async (_req, res) => {
  const lieux = await prisma.lieuLivraison.findMany();
  res.json(lieux);
});

/*** Lecture : détail d’un lieu (public) ************************************/
lieuLivraisonRouter.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const lieu = await prisma.lieuLivraison.findUnique({ where: { id_lieu_livraison: id } });
    if (!lieu) return res.status(404).json({ message: "Lieu non trouvé" });
    res.json(lieu);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création d’un lieu (admin) *********************************************/
lieuLivraisonRouter.post("/create", monMiddlewareBearer, isAdmin, async (req: Request, res: Response) => {
  const data = req.body?.data;
  if (!data?.nom_lieu || typeof data.prix_lieu !== "number")
    return res.status(400).json({ message: "nom_lieu et prix_lieu requis" });

  try {
    const created = await prisma.lieuLivraison.create({ data: { nom_lieu: data.nom_lieu, prix_lieu: data.prix_lieu } });
    res.status(201).json(created);
  } catch (error) {
    console.error("/lieu-livraison/create", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

/*** Mise à jour d’un lieu (admin) *******************************************/
lieuLivraisonRouter.put("/:id", monMiddlewareBearer, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const data = req.body?.data;
    if (!data) return res.status(400).json({ message: "Corps de requête manquant" });

    const updated = await prisma.lieuLivraison.update({
      where: { id_lieu_livraison: id },
      data: { nom_lieu: data.nom_lieu, prix_lieu: data.prix_lieu },
    });
    res.json(updated);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Suppression d’un lieu (admin) *******************************************/
lieuLivraisonRouter.delete("/:id", monMiddlewareBearer, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    await prisma.lieuLivraison.delete({ where: { id_lieu_livraison: id } });
    res.json({ message: "Lieu supprimé" });
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
