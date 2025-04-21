// Livraison.ts

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const livraisonRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - livraison liée à une commande
livraisonRouter.get("/commande/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID commande invalide" });

  try {
    const livraison = await prisma.livraison.findFirst({
      where: { id_commande: id },
      include: {
        MethodeLivraison: true,
        LieuLivraison: true,
        Livreur: true,
      },
    });

    if (!livraison) return res.status(404).json({ message: "Livraison non trouvée" });
    res.json(livraison);
  } catch (error) {
    console.error("Erreur récupération livraison :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ POST - création d’une livraison liée à une commande
livraisonRouter.post("/create", monMiddlewareBearer, async (req, res) => {
  const data = req.body.data;

  try {
    // 🔍 Vérification que la commande existe
    const commandeExist = await prisma.commande.findUnique({
      where: { id_commande: data.id_commande },
    });

    if (!commandeExist) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Création de la livraison
    const newLivraison = await prisma.livraison.create({
      data: {
        id_commande: data.id_commande,
        id_methode_livraison: data.id_methode_livraison,
        id_lieu_livraison: data.id_lieu_livraison,
        id_livreur: data.id_livreur,
        date_livraison: data.date_livraison ? new Date(data.date_livraison) : null,
        adresse_livraison: data.adresse_livraison,
        code_postal_livraison: data.code_postal_livraison,
        ville_livraison: data.ville_livraison,
        pays_livraison: data.pays_livraison,
      },
    });

    res.status(201).json(newLivraison);
  } catch (error) {
    console.error("Erreur création livraison :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// ✅ PUT - modifier une livraison
livraisonRouter.put("/:id", monMiddlewareBearer, async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  try {
    const updatedLivraison = await prisma.livraison.update({
      where: { id_livraison: id },
      data: {
        id_methode_livraison: data.id_methode_livraison,
        id_lieu_livraison: data.id_lieu_livraison,
        id_livreur: data.id_livreur,
        date_livraison: data.date_livraison ? new Date(data.date_livraison) : undefined,
        adresse_livraison: data.adresse_livraison,
        code_postal_livraison: data.code_postal_livraison,
        ville_livraison: data.ville_livraison,
        pays_livraison: data.pays_livraison,
      },
    });

    res.json(updatedLivraison);
  } catch (error) {
    console.error("Erreur modification livraison :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE - supprimer une livraison
livraisonRouter.delete("/:id", monMiddlewareBearer, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.livraison.delete({ where: { id_livraison: id } });
    res.json({ message: "Livraison supprimée" });
  } catch (error) {
    console.error("Erreur suppression livraison :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
