import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { isAdmin } from "../../middleware/isAdmin";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const tvaRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - toutes les TVA
tvaRouter.get("/", async (req, res) => {
  try {
    const allTva = await prisma.tVA.findMany();
    res.json(allTva);
  } catch (error) {
    console.error("Erreur récupération TVA :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - TVA par ID
tvaRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const tva = await prisma.tVA.findUnique({ where: { id_tva: id } });
    if (!tva) return res.status(404).json({ message: "TVA non trouvée" });

    res.json(tva);
  } catch (error) {
    console.error("Erreur récupération TVA :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ POST - création (admin only)
tvaRouter.post("/create", isAdmin, async (req, res) => {
  const data = req.body.data;

  try {
    const newTva = await prisma.tVA.create({
      data: {
        taux_tva: data.taux_tva,
        description_tva: data.description_tva,
      },
    });

    res.status(201).json(newTva);
  } catch (error) {
    console.error("Erreur création TVA :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT - modification (admin only)
tvaRouter.put("/:id",monMiddlewareBearer,  isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const updatedTva = await prisma.tVA.update({
      where: { id_tva: id },
      data: { ...data },
    });

    res.json(updatedTva);
  } catch (error) {
    console.error("Erreur update TVA :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE - suppression (admin only)
tvaRouter.delete("/:id",monMiddlewareBearer, isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.tVA.delete({ where: { id_tva: id } });
    res.json({ message: "TVA supprimée" });
  } catch (error) {
    console.error("Erreur suppression TVA :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
