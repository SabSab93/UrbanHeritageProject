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




ligneCommandeRouter.get("/client/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID client invalide" });

  try {
    const lignes = await prisma.ligneCommande.findMany({
      where: { id_client: id },
      include: {
        Maillot: true,
      },
    });

    res.json(lignes);
  } catch (error) {
    console.error("Erreur récupération lignes client :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


ligneCommandeRouter.get("/client/:id/total", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID client invalide" });

  try {
    const lignes = await prisma.ligneCommande.findMany({
      where: { id_client: id },
      include: {
        Maillot: {
          select: {
            id_tva: true,
            TVA: { select: { taux_tva: true } }
          }
        }
      }
    });

    const total = lignes.reduce((acc, ligne) => {
      const tva = ligne.Maillot.TVA?.taux_tva ?? 20; 
      const prixAvecTva = Number(ligne.prix_ht) * (1 + Number(tva) / 100);
      return acc + ligne.quantite * prixAvecTva;
    }, 0);

    res.json({ total: total.toFixed(2) + " €" });
  } catch (error) {
    console.error("Erreur calcul total panier :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
