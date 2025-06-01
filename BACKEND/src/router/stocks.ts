import { Router } from "express";
import { PrismaClient, taille_maillot_enum } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";
import { paginationMiddleware } from "../middleware/pagination";

export const stockRouter = Router();
const prisma = new PrismaClient();

/*** Création ***************************************************************/

// Création : un stock pour une taille spécifique avec vérification
stockRouter.post("/create",monMiddlewareBearer,isAdmin, async (req, res) => {
  const { id_maillot, taille_maillot } = req.body.data;

  if (!id_maillot || !taille_maillot) {
    return res.status(400).json({ message: "Données incomplètes." });
  }

  try {
    const maillot = await prisma.maillot.findUnique({
      where: { id_maillot },
    });

    if (!maillot) {
      return res.status(404).json({ message: "Maillot non trouvé. Veuillez créer le maillot d'abord." });
    }

    const newStock = await prisma.stock.create({
      data: { id_maillot, taille_maillot },
    });

    res.status(201).json(newStock);
  } catch (error) {
    console.error("Erreur création stock :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Création : 4 stocks (S, M, L, XL) pour un maillot avec vérification
stockRouter.post("/create-multiple",monMiddlewareBearer,isAdmin, async (req, res) => {
  const { id_maillot } = req.body.data;

  if (!id_maillot) {
    return res.status(400).json({ message: "ID maillot manquant." });
  }

  try {
    const maillot = await prisma.maillot.findUnique({
      where: { id_maillot },
    });

    if (!maillot) {
      return res.status(404).json({ message: "Maillot non trouvé. Veuillez créer le maillot d'abord." });
    }

    const tailles = ["S", "M", "L", "XL"] as taille_maillot_enum[];

    const creations = await Promise.all(
      tailles.map((taille) =>
        prisma.stock.create({
          data: { id_maillot, taille_maillot: taille },
        })
      )
    );

    res.status(201).json({ message: "Stocks créés pour toutes les tailles.", stocks: creations });
  } catch (error) {
    console.error("Erreur création multiple stocks :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Lecture ***************************************************************/

// Lecture : liste tous les stocks avec dispo dynamique
stockRouter.get("/",paginationMiddleware, monMiddlewareBearer,isAdmin, async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({ include: { StockMaillot: true } });

    const recalculated = stocks.map((stock) => {
      const entrees = stock.StockMaillot.filter(m => m.type_mouvement === "entree")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);

      const sorties = stock.StockMaillot.filter(m => m.type_mouvement === "sortie")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);

      return {
        id_stock: stock.id_stock,
        id_maillot: stock.id_maillot,
        taille_maillot: stock.taille_maillot,
        quantite_disponible: entrees - sorties,
      };
    });

    res.json(recalculated);
  } catch (error) {
    console.error("Erreur récupération stocks :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lecture : un stock avec calcul dynamique
stockRouter.get("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const stock = await prisma.stock.findUnique({
      where: { id_stock: id },
      include: { StockMaillot: true },
    });

    if (!stock) return res.status(404).json({ message: "Stock non trouvé" });

    const entrees = stock.StockMaillot.filter(m => m.type_mouvement === "entree")
      .reduce((acc, curr) => acc + curr.quantite_stock, 0);

    const sorties = stock.StockMaillot.filter(m => m.type_mouvement === "sortie")
      .reduce((acc, curr) => acc + curr.quantite_stock, 0);

    res.json({
      id_stock: stock.id_stock,
      id_maillot: stock.id_maillot,
      taille_maillot: stock.taille_maillot,
      quantite_entree: entrees,
      quantite_sortie: sorties,
      quantite_disponible: entrees - sorties,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du stock :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lecture : détail par tailles d'un maillot (S, M, L, XL)
stockRouter.get("/detail/:id_maillot",monMiddlewareBearer,isAdmin, async (req, res) => {
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

      const entrees = stock.StockMaillot.filter(m => m.type_mouvement === "entree")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);

      const sorties = stock.StockMaillot.filter(m => m.type_mouvement === "sortie")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);

      return {
        id_stock: stock.id_stock,
        taille_maillot: taille,
        quantite_entree: entrees,
        quantite_sortie: sorties,
        quantite_disponible: entrees - sorties,
      };
    });

    res.json(stockDetailParTaille);
  } catch (error) {
    console.error("Erreur lors de la récupération du stock détaillé :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lecture : stock public par maillot (affichage front - tailles et quantités restantes)
stockRouter.get("/public/disponibilite/:id_maillot", async (req, res) => {
  const id_maillot = parseInt(req.params.id_maillot);
  if (isNaN(id_maillot)) return res.status(400).json({ message: "ID maillot invalide" });

  try {
    const stocks = await prisma.stock.findMany({
      where: { id_maillot },
      include: { StockMaillot: true },
    });

    const result = stocks.map((stock) => {
      const entrees = stock.StockMaillot.filter(m => m.type_mouvement === "entree")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);

      const sorties = stock.StockMaillot.filter(m => m.type_mouvement === "sortie")
        .reduce((acc, curr) => acc + curr.quantite_stock, 0);

      const disponible = entrees - sorties;

      return {
        taille_maillot: stock.taille_maillot,
        id_stock: stock.id_stock,
        quantite_disponible: disponible,
        statut: disponible === 0 ? "Rupture de stock" : disponible < 10 ? `Plus que ${disponible} en stock` : "Disponible"
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur récupération stock public :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


stockRouter.get('/public/disponibilite/:idMaillot', async (req, res) => {
  const idMaillot = parseInt(req.params.idMaillot, 10);
  if (isNaN(idMaillot)) {
    return res.status(400).json({ message: 'id_maillot invalide' });
  }

  try {
    // 1️⃣ Tous les stocks (une ligne par taille) du maillot
    const stocks = await prisma.stock.findMany({
      where: { id_maillot: idMaillot },
      select: { id_stock: true, taille_maillot: true }
    });

    // 2️⃣ Tous les mouvements, groupés par id_stock + type_mouvement
    const mouvements = await prisma.stockMaillot.groupBy({
      by: ['id_stock', 'type_mouvement'],
      where: {
        id_stock: { in: stocks.map(s => s.id_stock) }
      },
      _sum: { quantite_stock: true }
    });

    // 3️⃣ On reconstitue la quantité disponible pour chaque taille
    const dispo = stocks.map(s => {
      const totalEntree =
        mouvements
          .filter(m => m.id_stock === s.id_stock && m.type_mouvement === 'entree')
          .reduce((a, m) => a + (m._sum.quantite_stock ?? 0), 0);

      const totalSortie =
        mouvements
          .filter(m => m.id_stock === s.id_stock && m.type_mouvement === 'sortie')
          .reduce((a, m) => a + (m._sum.quantite_stock ?? 0), 0);

      const quantite = totalEntree - totalSortie;

      return {
        taille_maillot:        s.taille_maillot,
        quantite_disponible:   quantite,
        statut: quantite === 0 ? 'rupture' : quantite < 5 ? 'basse' : 'ok'
      };
    });

    res.json(dispo);
  } catch (err) {
    console.error('Erreur dispo stock :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/*** Suppression ***********************************************************/

// Suppression : supprimer un stock
stockRouter.delete("/:id",monMiddlewareBearer,isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const stock = await prisma.stock.findUnique({ where: { id_stock: id } });

    if (!stock) return res.status(404).json({ message: "Stock introuvable" });

    await prisma.stock.delete({ where: { id_stock: id } });
    res.json({ message: "Stock supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression stock :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
