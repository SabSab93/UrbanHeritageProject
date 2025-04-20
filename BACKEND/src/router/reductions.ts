// routes/reduction.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const reductionRouter = Router();
const prisma = new PrismaClient();

// ✅ GET toutes les réductions
reductionRouter.get("/", async (req, res) => {
  const reductions = await prisma.reduction.findMany();
  res.json(reductions);
});

// ✅ GET réduction par ID
reductionRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const reduction = await prisma.reduction.findUnique({
    where: { id_reduction: id },
  });

  if (!reduction) return res.status(404).json({ message: "Réduction non trouvée" });
  res.json(reduction);
});

// ✅ POST création réduction
reductionRouter.post("/create", async (req, res) => {
  try {
    const data = req.body.data;

    const newReduction = await prisma.reduction.create({
      data: {
        code_reduction: data.code_reduction,
        description: data.description,
        valeur_reduction: data.valeur_reduction,
        date_debut_reduction: data.date_debut_reduction,
        date_fin_reduction: data.date_fin_reduction,
        type_reduction: data.type_reduction,
        statut_reduction: data.statut_reduction,
      },
    });

    res.status(201).json(newReduction);
  } catch (error) {
    console.error("Erreur création réduction :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT modification réduction
reductionRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const updated = await prisma.reduction.update({
      where: { id_reduction: id },
      data: { ...data },
    });

    res.json(updated);
  } catch (error) {
    console.error("Erreur update réduction :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE réduction
reductionRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.reduction.delete({ where: { id_reduction: id } });
    res.json({ message: "Réduction supprimée" });
  } catch (error) {
    console.error("Erreur delete réduction :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
