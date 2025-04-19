import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const ligneCommandeRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - toutes les lignes
ligneCommandeRouter.get("/", async (req, res) => {
  const lignes = await prisma.ligneCommande.findMany();
  res.json(lignes);
});

// ✅ GET - ligne par ID
ligneCommandeRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const ligne = await prisma.ligneCommande.findUnique({
    where: { id_lignecommande: id },
  });

  if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
  res.json(ligne);
});

// ✅ POST - ajouter au panier
ligneCommandeRouter.post("/create", async (req, res) => {
  const data = req.body.data;

  try {
    const ligne = await prisma.ligneCommande.create({
      data: {
        id_client: data.id_client,
        id_maillot: data.id_maillot,
        taille_maillot: data.taille_maillot,
        quantite: data.quantite,
        prix_ht: data.prix_ht
      },
    });

    res.status(201).json(ligne);
  } catch (error) {
    console.error("Erreur création ligne commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT - modifier une ligne
ligneCommandeRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  try {
    const updated = await prisma.ligneCommande.update({
      where: { id_lignecommande: id },
      data: {
        ...data,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Erreur update ligne commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE - supprimer une ligne
ligneCommandeRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.ligneCommande.delete({ where: { id_lignecommande: id } });
    res.json({ message: "Ligne supprimée" });
  } catch (error) {
    console.error("Erreur suppression ligne commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
