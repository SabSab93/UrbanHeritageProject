import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";
import { paginationMiddleware } from "../middleware/pagination";

export const associationRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre d’URL en entier positif. */
const parseId = (raw: any): number => {
  const parsed = parseInt(raw as string, 10);
  if (Number.isNaN(parsed) || parsed <= 0) throw new Error("ID invalide");
  return parsed;
};

/*** Création (Admin) *********************************************************/
associationRouter.post(
  "/create",
  monMiddlewareBearer,
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const associationData = req.body?.data;
      if (!associationData)
        return res.status(400).json({ message: "Corps de requête manquant" });

      const requiredFields = [
        "nom_association",
        "numero_identification_association",
        "pays_association",
      ];
      const missingFields = requiredFields.filter(
        (field) => !associationData[field]
      );
      if (missingFields.length)
        return res.status(400).json({
          message: `Champs manquants : ${missingFields.join(", ")}`,
        });

      const newAssociation = await prisma.association.create({
        data: {
          nom_association: associationData.nom_association,
          numero_identification_association:
            associationData.numero_identification_association,
          adresse_siege_social_association:
            associationData.adresse_siege_social_association,
          pays_association: associationData.pays_association,
          site_web_association: associationData.site_web_association,
          url_image_association_1: associationData.url_image_association_1,
          url_image_association_2: associationData.url_image_association_2,
          url_image_association_3: associationData.url_image_association_3,
          description_association_1: associationData.description_association_1,
          description_association_2: associationData.description_association_2,
          description_association_3: associationData.description_association_3,
        },
      });

      res.status(201).json(newAssociation);
    } catch (error) {
      console.error("POST /association/create", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

/*** Lecture standard *********************************************************/
associationRouter.get("/",paginationMiddleware, async (_req, res) => {
  const associations = await prisma.association.findMany();
  res.json(associations);
});

associationRouter.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const association = await prisma.association.findUnique({
      where: { id_association: id },
    });
    if (!association)
      return res.status(404).json({ message: "Association non trouvée" });
    res.json(association);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Mise à jour & Suppression (Admin) ***************************************/
associationRouter.put(
  "/:id",
  monMiddlewareBearer,
  isAdmin,
  async (req, res) => {
    try {
      const id = parseId(req.params.id);
      const updatedAssociation = await prisma.association.update({
        where: { id_association: id },
        data: req.body.data,
      });
      res.json(updatedAssociation);
    } catch (error: any) {
      const status = error.message === "ID invalide" ? 400 : 500;
      res.status(status).json({ message: error.message ?? "Erreur serveur" });
    }
  }
);

associationRouter.delete(
  "/:id",
  monMiddlewareBearer,
  isAdmin,
  async (req, res) => {
    try {
      const id = parseId(req.params.id);
      await prisma.association.delete({ where: { id_association: id } });
      res.json({ message: "Association supprimée" });
    } catch (error: any) {
      const status = error.message === "ID invalide" ? 400 : 500;
      res.status(status).json({ message: error.message ?? "Erreur serveur" });
    }
  }
);
