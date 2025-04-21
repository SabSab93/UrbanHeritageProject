import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const ligneCommandePersonnalisationRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - toutes les personnalisations de lignes de commande
ligneCommandePersonnalisationRouter.get("/", async (req, res) => {
  const all = await prisma.ligneCommandePersonnalisation.findMany({
    include: {
      Personnalisation: true,
      LigneCommande: true,
    },
  });
  res.json(all);
});

// ✅ GET - personnalisations par ID ligne commande
ligneCommandePersonnalisationRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const ligne = await prisma.ligneCommandePersonnalisation.findMany({
    where: { id_lignecommande: id },
    include: {
      Personnalisation: true,
    },
  });

  if (!ligne || ligne.length === 0) return res.status(404).json({ message: "Aucune personnalisation trouvée" });
  res.json(ligne);
});

// ✅ POST - création d’une ligne de personnalisation
ligneCommandePersonnalisationRouter.post("/create", async (req, res) => {
  const { id_lignecommande, id_personnalisation } = req.body.data;

  try {
    // Récupérer le prix de la personnalisation au moment de l’ajout
    const personnalisation = await prisma.personnalisation.findUnique({
      where: { id_personnalisation },
    });

    if (!personnalisation) {
      return res.status(404).json({ message: "Personnalisation non trouvée" });
    }

    const created = await prisma.ligneCommandePersonnalisation.create({
      data: {
        id_lignecommande,
        id_personnalisation,
        prix_personnalisation_ht: personnalisation.prix_ht,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Erreur création :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT - modifier une ligne de personnalisation
ligneCommandePersonnalisationRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  try {
    const updated = await prisma.ligneCommandePersonnalisation.update({
      where: {
        id_lignecommande_id_personnalisation: {
          id_lignecommande: id,
          id_personnalisation: data.id_personnalisation,
        },
      },
      data: {
        prix_personnalisation_ht: data.prix_personnalisation_ht,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error("Erreur update :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE - suppression d’une personnalisation dans une ligne de commande
ligneCommandePersonnalisationRouter.delete("/:id_lignecommande/:id_personnalisation", async (req, res) => {
  const id_lignecommande = parseInt(req.params.id_lignecommande);
  const id_personnalisation = parseInt(req.params.id_personnalisation);

  try {
    await prisma.ligneCommandePersonnalisation.delete({
      where: {
        id_lignecommande_id_personnalisation: {
          id_lignecommande,
          id_personnalisation,
        },
      },
    });

    res.json({ message: "Personnalisation supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
