import { Router } from "express";
import { PrismaClient, type_mouvement_enum } from "@prisma/client";

export const stockmaillotRouter = Router();
const prisma = new PrismaClient();

// GET - tous les mouvements de stock
stockmaillotRouter.get("/", async (req, res) => {
  try {
    const mouvements = await prisma.stockMaillot.findMany({
      include: { Stock: true },
    });
    res.json(mouvements);
  } catch (error) {
    console.error("Erreur lors de la récupération des mouvements :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET - un mouvement par ID
stockmaillotRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const mouvement = await prisma.stockMaillot.findUnique({
      where: { id_stock_maillot: id },
      include: { Stock: true },
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

// POST - ajouter un mouvement (entrée ou sortie) et MAJ du stock
stockmaillotRouter.post("/create", async (req, res) => {
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

    // Crée le mouvement
    const mouvement = await prisma.stockMaillot.create({
      data: {
        id_stock: data.id_stock,
        quantite_stock: data.quantite_stock,
        type_mouvement: data.type_mouvement,
      },
    });

    // Met à jour le stock selon le type de mouvement
    let updateData: any = {};
    if (data.type_mouvement === "entree") {
      updateData = {
        quantite_entree: stock.quantite_entree + data.quantite_stock,
        quantite_total: stock.quantite_total + data.quantite_stock,
      };
    } else if  (data.type_mouvement === "sortie") {
      const mouvements = await prisma.stockMaillot.findMany({
        where: { id_stock: data.id_stock },
      });
    
      const totalEntree = mouvements
        .filter(m => m.type_mouvement === "entree")
        .reduce((acc, m) => acc + m.quantite_stock, 0);
    
      const totalSortie = mouvements
        .filter(m => m.type_mouvement === "sortie")
        .reduce((acc, m) => acc + m.quantite_stock, 0);
    
      const quantiteDisponible = totalEntree - totalSortie;
    
      if (data.quantite_stock > quantiteDisponible) {
        return res.status(400).json({
          message: `Stock insuffisant. Il reste ${quantiteDisponible} unités disponibles.`,
        });
      }
    }

    await prisma.stock.update({
      where: { id_stock: data.id_stock },
      data: updateData,
    });

    res.status(201).json(mouvement);
  } catch (error) {
    console.error("Erreur lors de la création du mouvement :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// DELETE - supprimer un mouvement et recalculer le stock
stockmaillotRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const mouvement = await prisma.stockMaillot.findUnique({
      where: { id_stock_maillot: id },
    });

    if (!mouvement) {
      return res.status(404).json({ message: "Mouvement introuvable" });
    }

    const stock = await prisma.stock.findUnique({
      where: { id_stock: mouvement.id_stock },
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock introuvable" });
    }

    // Mise à jour inversée
    let updateData: any = {};
    if (mouvement.type_mouvement === "entree") {
      updateData = {
        quantite_entree: stock.quantite_entree - mouvement.quantite_stock,
        quantite_total: stock.quantite_total - mouvement.quantite_stock,
      };
    } else if (mouvement.type_mouvement === "sortie") {
      updateData = {
        quantite_sortie: stock.quantite_sortie - mouvement.quantite_stock,
        quantite_total: stock.quantite_total + mouvement.quantite_stock,
      };
    }

    // Supprimer le mouvement
    await prisma.stockMaillot.delete({
      where: { id_stock_maillot: id },
    });

    // Mettre à jour le stock
    await prisma.stock.update({
      where: { id_stock: stock.id_stock },
      data: updateData,
    });

    res.json({ message: "Mouvement supprimé et stock mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du mouvement :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
