// routes/ligneCommandeReduction.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const ligneCommandeReductionRouter = Router();
const prisma = new PrismaClient();

// ✅ GET toutes les associations
ligneCommandeReductionRouter.get("/", async (req, res) => {
  const data = await prisma.ligneCommandeReduction.findMany();
  res.json(data);
});

// ✅ POST : appliquer une réduction à une ligne de commande
ligneCommandeReductionRouter.post("/create", async (req, res) => {
  try {
    const data = req.body.data;

    const link = await prisma.ligneCommandeReduction.create({
      data: {
        id_lignecommande: data.id_lignecommande,
        id_reduction: data.id_reduction,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error("Erreur création association reduction / ligne de commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE : supprimer l’association entre une ligne de commande et une réduction
ligneCommandeReductionRouter.delete("/", async (req, res) => {
  const { id_lignecommande, id_reduction } = req.body;

  try {
    await prisma.ligneCommandeReduction.delete({
      where: {
        id_lignecommande_id_reduction: {
          id_lignecommande,
          id_reduction,
        },
      },
    });

    res.json({ message: "Association reduction / ligne de commande  supprimée" });
  } catch (error) {
    console.error("Erreur suppression association reduction / ligne de commande  :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
