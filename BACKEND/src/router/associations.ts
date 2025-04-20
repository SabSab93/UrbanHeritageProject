import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const associationRouter = Router();
const prisma = new PrismaClient();

// ✅ GET toutes les associations
associationRouter.get("/", async (req, res) => {
  const associations = await prisma.association.findMany();
  res.json(associations);
});

// ✅ GET association par ID
associationRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const association = await prisma.association.findUnique({
    where: { id_maillot_association: id },
  });

  if (!association) return res.status(404).json({ message: "Association non trouvée" });
  res.json(association);
});

// ✅ POST création
associationRouter.post("/create", async (req, res) => {
  try {
    const data = req.body.data;

    const newAssociation = await prisma.association.create({
      data: {
        nom_association: data.nom_association,
        numero_identification_association: data.numero_identification_association,
        adresse_siege_social_association: data.adresse_siege_social_association,
        pays_association: data.pays_association,
        site_web_association: data.site_web_association,
        url_image_association_1: data.url_image_association_1,
        url_image_association_2: data.url_image_association_2,
        url_image_association_3: data.url_image_association_3,
        description_association_1: data.description_association_1,
        description_association_2: data.description_association_2,
        description_association_3: data.description_association_3,
        id_maillot_association: data.id_maillot_association
      },
    });

    res.status(201).json(newAssociation);
  } catch (error) {
    console.error("Erreur création association :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT modification
associationRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const updatedAssociation = await prisma.association.update({
      where: { id_maillot_association: id },
      data: {
        ...data
      },
    });

    res.json(updatedAssociation);
  } catch (error) {
    console.error("Erreur update association :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE
associationRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.association.delete({ where: { id_maillot_association: id } });
    res.json({ message: "Association supprimée" });
  } catch (error) {
    console.error("Erreur delete association :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
