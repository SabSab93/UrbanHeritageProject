import { Router } from "express";
import { PrismaClient, taille_maillot_enum } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const stockRouter = Router();
const prisma = new PrismaClient();

// POST /stock/create - Créer un stock
stockRouter.post("/create", async (req, res) => {
  const data = req.body.data;

  if (!data || !data.id_maillot || !data.taille_maillot) {
    return res.status(400).json({ message: "Données incomplètes" });
  }

  try {
    const newStock = await prisma.stock.create({
      data: {
        id_maillot: data.id_maillot,
        taille_maillot: data.taille_maillot,
      },
    });

    return res.status(201).json(newStock);
  } catch (error) {
    console.error("Erreur lors de la création du stock :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création du stock" });
  }
});

// GET /stock - Récupérer tous les stocks avec calcul dynamique
stockRouter.get("/", async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        StockMaillot: true,
      },
    });

    const recalculated = stocks.map((stock) => {
      const totalEntree = stock.StockMaillot.filter(m => m.type_mouvement === "entree")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);

      const totalSortie = stock.StockMaillot.filter(m => m.type_mouvement === "sortie")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);

      return {
        id_stock: stock.id_stock,
        id_maillot: stock.id_maillot,
        taille_maillot: stock.taille_maillot,
        quantite_entree: totalEntree,
        quantite_sortie: totalSortie,
        quantite_disponible: totalEntree - totalSortie,
      };
    });

    res.json(recalculated);
  } catch (error) {
    console.error("Erreur lors de la récupération des stocks :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /stock/:id - Récupérer un stock avec calcul dynamique
stockRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const stock = await prisma.stock.findUnique({
      where: { id_stock: id },
      include: { StockMaillot: true },
    });

    if (!stock) return res.status(404).json({ message: "Stock non trouvé" });

    const totalEntree = stock.StockMaillot.filter(m => m.type_mouvement === "entree")
      .reduce((acc, curr) => acc + curr.quantite_stock, 0);

    const totalSortie = stock.StockMaillot.filter(m => m.type_mouvement === "sortie")
      .reduce((acc, curr) => acc + curr.quantite_stock, 0);

    res.json({
      id_stock: stock.id_stock,
      id_maillot: stock.id_maillot,
      taille_maillot: stock.taille_maillot,
      quantite_entree: totalEntree,
      quantite_sortie: totalSortie,
      quantite_disponible: totalEntree - totalSortie,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du stock :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE /stock/:id - Supprimer un stock
stockRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const stock = await prisma.stock.findUnique({
      where: { id_stock: id },
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock introuvable" });
    }

    await prisma.stock.delete({ where: { id_stock: id } });
    res.json({ message: "Stock supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du stock :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
});

// GET /stock/detail/:id_maillot - Détail du stock par taille (affiche tout même sans mouvements)
stockRouter.get("/detail/:id_maillot", async (req, res) => {
  const id_maillot = parseInt(req.params.id_maillot);
  if (isNaN(id_maillot)) {
    return res.status(400).json({ message: "ID maillot invalide" });
  }

  try {
    const tailles = Object.values(taille_maillot_enum);

    const stocks = await prisma.stock.findMany({
      where: { id_maillot },
      include: { StockMaillot: true },
    });

    const stockDetailParTaille = tailles.map((taille) => {
      const stock = stocks.find((s) => s.taille_maillot === taille);
    
      if (!stock) {
        return {
          taille_maillot: taille,
          id_stock: null,
          quantite_entree: 0,
          quantite_sortie: 0,
          quantite_disponible: 0,
        };
      }
    
      const totalEntree = stock.StockMaillot
        .filter((m) => m.type_mouvement === "entree")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);
    
      const totalSortie = stock.StockMaillot
        .filter((m) => m.type_mouvement === "sortie")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);
    
      const quantiteDispo = totalEntree - totalSortie;
    
      return {
        id_stock: stock.id_stock,
        taille_maillot: taille,
        quantite_entree: totalEntree,
        quantite_sortie: totalSortie,
        quantite_disponible: quantiteDispo,
      };
    });

    res.json(stockDetailParTaille);
  } catch (error) {
    console.error("Erreur lors de la récupération du stock détaillé :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
