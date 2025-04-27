import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

export const personnalisationRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - toutes les personnalisations
personnalisationRouter.get("/", async (req, res) => {
  try {
    const data = await prisma.personnalisation.findMany();
    res.json(data);
  } catch (error) {
    console.error("Erreur GET personnalisations :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - une personnalisation par ID
personnalisationRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const data = await prisma.personnalisation.findUnique({ where: { id_personnalisation: id } });
    if (!data) return res.status(404).json({ message: "Personnalisation non trouvée" });
    res.json(data);
  } catch (error) {
    console.error("Erreur GET/:id personnalisation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ POST - créer une personnalisation (admin uniquement)
personnalisationRouter.post("/create", async (req, res) => {
  const data = req.body.data;

  try {
    const created = await prisma.personnalisation.create({
      data: {
        type_personnalisation: data.type_personnalisation,
        prix_ht: data.prix_ht,
        description: data.description ?? "",
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Erreur POST personnalisation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT - modifier une personnalisation (admin uniquement)
personnalisationRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const updated = await prisma.personnalisation.update({
      where: { id_personnalisation: id },
      data: {
        type_personnalisation: data.type_personnalisation,
        prix_ht: data.prix_ht,
        description: data.description ?? "",
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Erreur PUT personnalisation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE - supprimer une personnalisation (admin uniquement)
personnalisationRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.personnalisation.delete({ where: { id_personnalisation: id } });
    res.json({ message: "Personnalisation supprimée" });
  } catch (error) {
    console.error("Erreur DELETE personnalisation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
