import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isAdmin } from "../../middleware/isAdmin";
import { checkCommandeTransaction } from "../utils/CheckCommandeTransaction";
import { monMiddlewareBearer } from "../../middleware/checkToken";


export const commandeRouter = Router();
const prisma = new PrismaClient();

// ✅ POST - Créer une commande (authentifié)
commandeRouter.post("/create", async (req: any, res) => {
  try {
    const idClient = req.decoded.id_client;

    const lignes = await prisma.ligneCommande.findMany({
      where: {
        id_client: idClient,
        id_commande: null,
      },
    });

    if (lignes.length === 0) {
      return res.status(400).json({ message: "Panier vide. Aucune ligne à commander." });
    }

    const nouvelleCommande = await prisma.commande.create({
      data: {
        id_client: idClient,
        date_commande: new Date(),
        statut_commande: "en_cours",
      },
    });

    for (const ligne of lignes) {
      await prisma.ligneCommande.update({
        where: { id_lignecommande: ligne.id_lignecommande },
        data: { id_commande: nouvelleCommande.id_commande },
      });
    }

    res.status(201).json({ message: "Commande créée", commande: nouvelleCommande });
  } catch (error) {
    console.error("Erreur création commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - Toutes les commandes du client
commandeRouter.get("/", async (req: any, res) => {
  const idClient = req.decoded.id_client;

  const commandes = await prisma.commande.findMany({
    where: { id_client: idClient },
    include: { LigneCommande: true }
  });

  res.json(commandes);
});

// ✅ GET - Une commande par ID
commandeRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const commande = await prisma.commande.findUnique({
    where: { id_commande: id },
    include: { LigneCommande: true }
  });

  if (!commande) return res.status(404).json({ message: "Commande non trouvée" });

  res.json(commande);
});

// ✅ PUT - Modifier statut commande (admin ou systeme)
commandeRouter.put("/:id", isAdmin ,async (req, res) => {
  const id = parseInt(req.params.id);
  const { statut_commande } = req.body.data;

  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const updatedCommande = await prisma.commande.update({
      where: { id_commande: id },
      data: { statut_commande },
    });

    res.json({ message: "Statut mis à jour", commande: updatedCommande });
  } catch (error) {
    console.error("Erreur update commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE - Supprimer une commande (admin uniquement ?)
commandeRouter.delete("/:id", isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.commande.delete({ where: { id_commande: id } });
    res.json({ message: "Commande supprimée" });
  } catch (error) {
    console.error("Erreur delete commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


commandeRouter.get("/:id/details", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const commande = await prisma.commande.findUnique({
      where: { id_commande: id },
      include: {
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison: true,
            Livreur: true,
          },
        },
        LigneCommande: {
          include: {
            Maillot: true,
          },
        },
      },
    });

    if (!commande) return res.status(404).json({ message: "Commande introuvable" });

    res.json(commande);
  } catch (error) {
    console.error("Erreur récupération commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



commandeRouter.post("/finaliser", monMiddlewareBearer, async (req: Request, res: Response) => {
  try {
    const { id_client, lignes, livraison } = req.body;

    if (!id_client || !lignes || !livraison) {
      return res.status(400).json({ message: "Champs manquants dans la requête." });
    }

    const commande = await checkCommandeTransaction(id_client, lignes, livraison);
    return res.status(201).json({
      message: "Commande finalisée avec succès",
      commande,
    });
  } catch (error: any) {
    console.error("Erreur de commande :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la finalisation de la commande.",
      details: error?.message || error,
    });
  }
});
