import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

export const stockmaillotRouter = Router();
const prisma = new PrismaClient();

/*** Lecture ***************************************************************/

// Lecture : tous les mouvements de stock
stockmaillotRouter.get("/",monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const mouvements = await prisma.stockMaillot.findMany({
      include: {
        Stock: {
          select: {
            id_stock: true,
            id_maillot: true,
            taille_maillot: true,
          },
        },
      },
    });
    res.json(mouvements);
  } catch (error) {
    console.error("Erreur lors de la récupération des mouvements :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lecture : un mouvement par ID
stockmaillotRouter.get("/:id",monMiddlewareBearer,isAdmin,  async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const mouvement = await prisma.stockMaillot.findUnique({
      where: { id_stock_maillot: id },
      include: {
        Stock: {
          select: {
            id_stock: true,
            id_maillot: true,
            taille_maillot: true,
          },
        },
      },
    });

    if (!mouvement) {
      return res.status(404).json({ message: "Mouvement non trouvé" });
    }

    res.json(mouvement);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lecture : tous les mouvements d'un stock précis
stockmaillotRouter.get("/stock/:id_stock", monMiddlewareBearer,isAdmin,  async (req, res) => {
  const id_stock = parseInt(req.params.id_stock);

  if (isNaN(id_stock)) {
    return res.status(400).json({ message: "ID stock invalide" });
  }

  try {
    const mouvements = await prisma.stockMaillot.findMany({
      where: { id_stock },
      orderBy: { date_mouvement: "desc" },
      include: {
        Stock: {
          select: {
            id_maillot: true,
            taille_maillot: true,
          },
        },
      },
    });

    res.json(mouvements);
  } catch (error) {
    console.error("Erreur lors de la récupération des mouvements par stock :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Création ***************************************************************/

// Création : ajouter un mouvement (entrée ou sortie)
stockmaillotRouter.post("/create",monMiddlewareBearer, async (req, res) => {
  const data = req.body.data;

  if (!data || !data.id_stock || !data.quantite_stock || !data.type_mouvement) {
    return res.status(400).json({ message: "Données incomplètes" });
  }

  if (!["entree", "sortie"].includes(data.type_mouvement)) {
    return res.status(400).json({ message: "Type de mouvement invalide" });
  }

  try {
    const stock = await prisma.stock.findUnique({
      where: { id_stock: data.id_stock },
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock introuvable" });
    }

    if (data.type_mouvement === "sortie") {
      const mouvements = await prisma.stockMaillot.findMany({
        where: { id_stock: data.id_stock },
      });

      const totalEntree = mouvements.filter((m) => m.type_mouvement === "entree").reduce((acc, m) => acc + m.quantite_stock, 0);
      const totalSortie = mouvements.filter((m) => m.type_mouvement === "sortie").reduce((acc, m) => acc + m.quantite_stock, 0);
      const quantiteDisponible = totalEntree - totalSortie;

      if (data.quantite_stock > quantiteDisponible) {
        return res.status(400).json({ message: `Stock insuffisant. Il reste ${quantiteDisponible} unités disponibles.` });
      }
    }

    const mouvement = await prisma.stockMaillot.create({
      data: {
        id_stock: data.id_stock,
        quantite_stock: data.quantite_stock,
        type_mouvement: data.type_mouvement,
      },
    });

    res.status(201).json(mouvement);
  } catch (error) {
    console.error("Erreur lors de la création du mouvement :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Suppression ***********************************************************/

// Suppression : supprimer un mouvement (sans mise à jour des champs obsolètes)
stockmaillotRouter.delete("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const mouvement = await prisma.stockMaillot.findUnique({
      where: { id_stock_maillot: id },
    });

    if (!mouvement) {
      return res.status(404).json({ message: "Mouvement introuvable" });
    }

    await prisma.stockMaillot.delete({
      where: { id_stock_maillot: id },
    });

    res.json({ message: "Mouvement supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du mouvement :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
