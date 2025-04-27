import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const maillotRouter = Router();
const prisma = new PrismaClient();


// POST
maillotRouter.post("/create", async (req, res) => {
  try {
    const data = req.body.data;

    if (
      !data ||
      !data.nom_maillot ||
      !data.pays_maillot ||
      typeof data.prix_ht_maillot !== "number" ||
      !data.id_artiste ||
      !data.id_association
    ) {
      return res.status(400).json({ message: "Données incomplètes" });
    }

    const newMaillot = await prisma.maillot.create({
      data: {
        id_artiste: data.id_artiste,
        id_association: data.id_association,
        id_tva: data.id_tva,
        nom_maillot: data.nom_maillot,
        pays_maillot: data.pays_maillot,
        description_maillot: data.description_maillot,
        composition_maillot: data.composition_maillot,
        url_image_maillot_1: data.url_image_maillot_1,
        url_image_maillot_2: data.url_image_maillot_2,
        url_image_maillot_3: data.url_image_maillot_3,
        origine: data.origine,
        tracabilite: data.tracabilite,
        entretien: data.entretien,
        prix_ht_maillot: data.prix_ht_maillot,
      },
    });

    return res.status(201).json(newMaillot);
  } catch (error) {
    console.error("Erreur lors de la création du maillot :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création du maillot" });
  }
});

// GET
maillotRouter.get("/", async (req, res) => {
  const maillots = await prisma.maillot.findMany();
  res.json(maillots);
})


// GET ID
maillotRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }

  const maillot = await prisma.maillot.findUnique({
    where: { id_maillot: id },
  });

  if (!maillot) {
    return res.status(404).json({ error: "Maillot non trouvé" });
  }

  res.json(maillot);
});


// DELETE

maillotRouter.delete("/:id", async (req, res) => {
  const maillotId = parseInt(req.params.id);

  if (isNaN(maillotId)) {
    return res.status(400).json({ message: "ID de maillot invalide" });
  }

  const maillot = await prisma.maillot.findUnique({
    where: { id_maillot: maillotId },
  });

  if (!maillot) {
    return res.status(404).json({ message: "Maillot introuvable" });
  }

  await prisma.maillot.delete({
    where: { id_maillot: maillotId },
  });

  res.json({ message: "Maillot supprimé avec succès" });
});


//PUT
maillotRouter.put("/:id", async (req, res) => {
  const maillotId = parseInt(req.params.id);

  if (isNaN(maillotId)) {
    return res.status(400).json({ message: "ID de maillot invalide" });
  }

  const maillot = await prisma.maillot.findUnique({
    where: { id_maillot: maillotId },
  });

  if (!maillot) {
    return res.status(404).json({ message: "Maillot introuvable" });
  }

  const data = req.body.data;

  try {
    const updatedMaillot = await prisma.maillot.update({
      where: { id_maillot: maillotId },
      data: {
        nom_maillot: data.nom_maillot,
        pays_maillot: data.pays_maillot,
        description_maillot: data.description_maillot,
        composition_maillot: data.composition_maillot,
        url_image_maillot_1: data.url_image_maillot_1,
        url_image_maillot_2: data.url_image_maillot_2,
        url_image_maillot_3: data.url_image_maillot_3,
        origine: data.origine,
        tracabilite: data.tracabilite,
        entretien: data.entretien,
        prix_ht_maillot: data.prix_ht_maillot,
        id_tva: data.id_tva,
      },
    });

    res.json(updatedMaillot);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du maillot :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour du maillot" });
  }
});


