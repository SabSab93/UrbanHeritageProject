import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const avisRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - tous les avis
avisRouter.get("/", async (req, res) => {
  const avis = await prisma.avis.findMany();
  res.json(avis);
});

// ✅ GET - un avis par ID
avisRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const avis = await prisma.avis.findUnique({ where: { id_avis: id } });
  if (!avis) return res.status(404).json({ message: "Avis non trouvé" });

  res.json(avis);
});

// ✅ GET - tous les avis d’un maillot
avisRouter.get("/maillot/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const avis = await prisma.avis.findMany({
    where: { id_maillot: id },
    include: { Client: true },
  });

  res.json(avis);
});


// ✅ POST - création d’un avis (protégé)
avisRouter.post("/create", monMiddlewareBearer, async (req: any, res) => {
  const data = req.body.data;

  if (!data || !data.id_client || !data.id_maillot || !data.classement_avis || !data.titre_avis || !data.description_avis) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  try {
    // 1. Vérifier si le client a une commande livrée contenant ce maillot
    const ligneCommande = await prisma.ligneCommande.findFirst({
      where: {
        id_client: data.id_client,
        id_maillot: data.id_maillot,
        Commande: {
          statut_commande: "livre", // uniquement si commande est LIVRÉE
        },
      },
      include: { Commande: true }
    });

    if (!ligneCommande) {
      return res.status(403).json({ message: "Vous devez avoir reçu ce maillot pour laisser un avis." });
    }

    // 2. Vérifier si un avis existe déjà pour ce maillot et ce client
    const avisExist = await prisma.avis.findFirst({
      where: {
        id_client: data.id_client,
        id_maillot: data.id_maillot,
      },
    });

    if (avisExist) {
      return res.status(409).json({ message: "Vous avez déjà laissé un avis pour ce maillot." });
    }

    // 3. Créer l'avis
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

    res.status(201).json({ message: "Merci pour votre avis 🎉", avis: newAvis });

  } catch (error) {
    console.error("Erreur création avis :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// ✅ DELETE - avis par ID
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


// ✅ GET - Détails des avis + stats d'un maillot
avisRouter.get("/maillot/:id/stats", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const avis = await prisma.avis.findMany({
      where: { id_maillot: id },
      include: { Client: true },
    });

    if (avis.length === 0) {
      return res.status(404).json({ message: "Aucun avis pour ce maillot" });
    }

    // Calculer la note moyenne
    const totalNotes = avis.reduce((acc, a) => acc + a.classement_avis, 0);
    const moyenne = (totalNotes / avis.length).toFixed(1); // moyenne sur 5 arrondie à 1 chiffre

    res.json({
      nombreAvis: avis.length,
      noteMoyenne: moyenne,
      avis,
    });
  } catch (error) {
    console.error("Erreur récupération avis :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
