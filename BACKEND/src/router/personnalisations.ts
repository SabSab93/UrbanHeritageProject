import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";

export const personnalisationRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre en entier positif. */
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};

/*** Lecture *****************************************************************/

// Lecture : toutes les personnalisations
personnalisationRouter.get("/", async (_req, res) => {
  try {
    const data = await prisma.personnalisation.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lecture : personnalisation par ID
personnalisationRouter.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id, "id_personnalisation");
    const data = await prisma.personnalisation.findUnique({ where: { id_personnalisation: id } });
    if (!data) return res.status(404).json({ message: "Personnalisation non trouvée" });
    res.json(data);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création ***************************************************************/

personnalisationRouter.post("/create",monMiddlewareBearer,isAdmin, async (req, res) => {
  const { type_personnalisation, prix_ht, description = "" } = req.body?.data || {};
  if (!type_personnalisation || typeof prix_ht !== "number")
    return res.status(400).json({ message: "Champs requis manquants" });

  try {
    const created = await prisma.personnalisation.create({
      data: { type_personnalisation, prix_ht, description },
    });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Mise à jour *************************************************************/

personnalisationRouter.put("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  const { type_personnalisation, prix_ht, description = "" } = req.body?.data || {};
  try {
    const id = parseId(req.params.id, "id_personnalisation");
    const updated = await prisma.personnalisation.update({
      where: { id_personnalisation: id },
      data: { type_personnalisation, prix_ht, description },
    });
    res.json(updated);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Suppression *************************************************************/

personnalisationRouter.delete("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id, "id_personnalisation");
    await prisma.personnalisation.delete({ where: { id_personnalisation: id } });
    res.json({ message: "Personnalisation supprimée" });
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
