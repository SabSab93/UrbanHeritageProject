import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { moveSyntheticComments } from "typescript";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

export const livreurRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre en entier positif. */
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};

/*** Lecture *****************************************************************/

// Lecture : tous les livreurs
livreurRouter.get("/", async (_req, res) => {
  const livreurs = await prisma.livreur.findMany();
  res.json(livreurs);
});

// Lecture : livreur par ID
livreurRouter.get("/:id_livreur", async (req, res) => {
  try {
    const id = parseId(req.params.id_livreur, "id_livreur");
    const livreur = await prisma.livreur.findUnique({ where: { id_livreur: id } });
    if (!livreur) return res.status(404).json({ message: "Livreur non trouvé" });
    res.json(livreur);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création ***************************************************************/

livreurRouter.post("/create",monMiddlewareBearer, isAdmin, async (req: Request, res: Response) => {
  const { nom_livreur } = req.body?.data || {};
  if (!nom_livreur) return res.status(400).json({ message: "nom_livreur requis" });

  try {
    const created = await prisma.livreur.create({ data: { nom_livreur } });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Mise à jour *************************************************************/

livreurRouter.put("/:id_livreur", async (req, res) => {
  try {
    const id = parseId(req.params.id_livreur, "id_livreur");
    const { nom_livreur } = req.body?.data || {};
    if (!nom_livreur) return res.status(400).json({ message: "nom_livreur requis" });

    const updated = await prisma.livreur.update({ where: { id_livreur: id }, data: { nom_livreur } });
    res.json(updated);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Suppression *************************************************************/

livreurRouter.delete("/:id_livreur",monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id_livreur, "id_livreur");
    await prisma.livreur.delete({ where: { id_livreur: id } });
    res.json({ message: "Livreur supprimé" });
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
