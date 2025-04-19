import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../checkToken";

export const avisRouter = Router();
const prisma = new PrismaClient();

// ✅ GET tous les avis
avisRouter.get("/", async (req, res) => {
  const avis = await prisma.avis.findMany();
  res.json(avis);
});

// ✅ GET avis par ID
avisRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const avis = await prisma.avis.findUnique({ where: { id_avis: id } });

  if (!avis) return res.status(404).json({ message: "Avis non trouvé" });
  res.json(avis);
});

// ✅ POST création d’un avis (protégé)
avisRouter.post("/create", monMiddlewareBearer, async (req, res) => {
  const data = req.body.data;

  // ⚠️ Vérifie d'abord que le client a commandé ce maillot
  const commande = await prisma.ligneCommande.findFirst({
    where: {
      id_client: data.id_client,
      id_maillot: data.id_maillot
    }
  });

  if (!commande) {
    return res.status(403).json({ message: "Vous ne pouvez laisser un avis que si vous avez commandé ce maillot." });
  }

  try {
    const newAvis = await prisma.avis.create({
      data: {
        id_maillot: data.id_maillot,
        id_client: data.id_client,
        classement_avis: data.classement_avis,
        titre_avis: data.titre_avis,
        description_avis: data.description_avis,
        date_avis: new Date(),
      },
    });

    res.status(201).json(newAvis);
  } catch (error) {
    console.error("Erreur création avis :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE avis
avisRouter.delete("/:id", monMiddlewareBearer, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.avis.delete({ where: { id_avis: id } });
    res.json({ message: "Avis supprimé" });
  } catch (error) {
    console.error("Erreur suppression avis :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
