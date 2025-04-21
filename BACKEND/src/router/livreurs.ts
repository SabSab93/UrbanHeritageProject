import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const livreurRouter = Router();
const prisma = new PrismaClient();

// GET
livreurRouter.get("/", async (req, res) => {
  const data = await prisma.livreur.findMany();
  res.json(data);
});

// GET ID
livreurRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await prisma.livreur.findUnique({ where: { id_livreur: id } });
  if (!data) return res.status(404).json({ message: "Livreur non trouvé" });
  res.json(data);
});

// CREATE
livreurRouter.post("/create", async (req, res) => {
  const data = req.body.data;
  try {
    const created = await prisma.livreur.create({
      data: {
        nom_livreur: data.nom_livreur,
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error("Erreur création livreur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT
livreurRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  try {
    const updated = await prisma.livreur.update({
      where: { id_livreur: id },
      data: {
        nom_livreur: data.nom_livreur,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error("Erreur update livreur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE
livreurRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.livreur.delete({ where: { id_livreur: id } });
    res.json({ message: "Livreur supprimé" });
  } catch (error) {
    console.error("Erreur suppression livreur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
