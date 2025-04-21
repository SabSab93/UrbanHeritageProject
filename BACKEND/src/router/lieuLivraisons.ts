import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const lieuLivraisonRouter = Router();
const prisma = new PrismaClient();

// GET
lieuLivraisonRouter.get("/", async (req, res) => {
  const data = await prisma.lieuLivraison.findMany();
  res.json(data);
});

// GET ID
lieuLivraisonRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await prisma.lieuLivraison.findUnique({ where: { id_lieu_livraison: id } });
  if (!data) return res.status(404).json({ message: "Lieu non trouvé" });
  res.json(data);
});

// CREATE
lieuLivraisonRouter.post("/create", async (req, res) => {
  const data = req.body.data;
  try {
    const created = await prisma.lieuLivraison.create({
      data: {
        nom_lieu: data.nom_lieu,
        prix_lieu: data.prix_lieu,
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error("Erreur création lieu :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT
lieuLivraisonRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  try {
    const updated = await prisma.lieuLivraison.update({
      where: { id_lieu_livraison: id },
      data: {
        nom_lieu: data.nom_lieu,
        prix_lieu: data.prix_lieu,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error("Erreur update lieu :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE
lieuLivraisonRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.lieuLivraison.delete({ where: { id_lieu_livraison: id } });
    res.json({ message: "Lieu supprimé" });
  } catch (error) {
    console.error("Erreur suppression lieu :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
