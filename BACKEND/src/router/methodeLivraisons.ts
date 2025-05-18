import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";

export const methodeLivraisonRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre en entier positif. */
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};

/*** Lecture *****************************************************************/

// Lecture : toutes les méthodes
methodeLivraisonRouter.get("/", async (_req, res) => {
  const méthodes = await prisma.methodeLivraison.findMany();
  res.json(méthodes);
});

// Lecture : méthode par ID
methodeLivraisonRouter.get("/:id_methode", async (req, res) => {
  try {
    const id = parseId(req.params.id_methode, "id_methode_livraison");
    const méthode = await prisma.methodeLivraison.findUnique({ where: { id_methode_livraison: id } });
    if (!méthode) return res.status(404).json({ message: "Méthode non trouvée" });
    res.json(méthode);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création ***************************************************************/

methodeLivraisonRouter.post("/create",monMiddlewareBearer,isAdmin, async (req: Request, res: Response) => {
  const { nom_methode, prix_methode } = req.body?.data || {};
  if (!nom_methode || typeof prix_methode !== "number")
    return res.status(400).json({ message: "nom_methode et prix_methode requis" });

  try {
    const created = await prisma.methodeLivraison.create({ data: { nom_methode, prix_methode } });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Mise à jour *************************************************************/

methodeLivraisonRouter.put("/:id_methode",monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id_methode, "id_methode_livraison");
    const { nom_methode, prix_methode } = req.body?.data || {};
    if (!nom_methode || typeof prix_methode !== "number")
      return res.status(400).json({ message: "nom_methode et prix_methode requis" });

    const updated = await prisma.methodeLivraison.update({
      where: { id_methode_livraison: id },
      data: { nom_methode, prix_methode },
    });
    res.json(updated);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Suppression *************************************************************/

methodeLivraisonRouter.delete("/:id_methode",monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id_methode, "id_methode_livraison");
    await prisma.methodeLivraison.delete({ where: { id_methode_livraison: id } });
    res.json({ message: "Méthode supprimée" });
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
