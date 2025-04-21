import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const methodeLivraisonRouter = Router();
const prisma = new PrismaClient();

// GET
methodeLivraisonRouter.get("/", async (req, res) => {
  const data = await prisma.methodeLivraison.findMany();
  res.json(data);
});

// GET ID
methodeLivraisonRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await prisma.methodeLivraison.findUnique({ where: { id_methode_livraison: id } });
  if (!data) return res.status(404).json({ message: "Méthode non trouvée" });
  res.json(data);
});

// CREATE
methodeLivraisonRouter.post("/create", async (req, res) => {
  const data = req.body.data;
  try {
    const created = await prisma.methodeLivraison.create({
      data: {
        nom_methode: data.nom_methode,
        prix_methode: data.prix_methode,
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error("Erreur création méthode :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT
methodeLivraisonRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  try {
    const updated = await prisma.methodeLivraison.update({
      where: { id_methode_livraison: id },
      data: {
        nom_methode: data.nom_methode,
        prix_methode: data.prix_methode,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error("Erreur update méthode :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE
methodeLivraisonRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.methodeLivraison.delete({ where: { id_methode_livraison: id } });
    res.json({ message: "Méthode supprimée" });
  } catch (error) {
    console.error("Erreur suppression méthode :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
