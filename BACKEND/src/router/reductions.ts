import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

export const reductionRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre en entier positif. */
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};

/*** Lecture *****************************************************************/

// Lecture : toutes les réductions
reductionRouter.get("/",monMiddlewareBearer,isAdmin, async (_req, res) => {
  try {
    const reductions = await prisma.reduction.findMany();
    res.json(reductions);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lecture : réduction par ID
reductionRouter.get("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id, "id_reduction");
    const reduction = await prisma.reduction.findUnique({ where: { id_reduction: id } });
    if (!reduction) return res.status(404).json({ message: "Réduction non trouvée" });
    res.json(reduction);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

// Lecture : réductions actives pour le front
reductionRouter.get("/public/actives", async (_req, res) => {
  const now = new Date();
  try {
    const activeReductions = await prisma.reduction.findMany({
      where: {
        statut_reduction: "active",
        date_debut_reduction: { lte: now },
        date_fin_reduction: { gte: now },
      },
      orderBy: { date_debut_reduction: "asc" },
    });
    res.json(activeReductions);
  } catch (error) {
    console.error("Erreur récupération réductions actives :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Création ***************************************************************/

reductionRouter.post("/create",monMiddlewareBearer,isAdmin, async (req, res) => {
  const data = req.body?.data;
  try {
    const newReduction = await prisma.reduction.create({
      data: {
        code_reduction: data.code_reduction,
        description: data.description,
        valeur_reduction: data.valeur_reduction,
        date_debut_reduction: data.date_debut_reduction,
        date_fin_reduction: data.date_fin_reduction,
        type_reduction: data.type_reduction,
        statut_reduction: data.statut_reduction,
      },
    });
    res.status(201).json(newReduction);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Mise à jour *************************************************************/

reductionRouter.put("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  const data = req.body?.data;
  try {
    const id = parseId(req.params.id, "id_reduction");
    const updated = await prisma.reduction.update({ where: { id_reduction: id }, data });
    res.json(updated);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Suppression *************************************************************/

reductionRouter.delete("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id, "id_reduction");
    await prisma.reduction.delete({ where: { id_reduction: id } });
    res.json({ message: "Réduction supprimée" });
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
