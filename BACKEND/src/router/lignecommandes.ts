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

// ✅ POST - ajouter au panier avec récupération automatique du prix HT
ligneCommandeRouter.post("/create", async (req, res) => {
  const data = req.body.data;

  try {
    // On récupère le maillot pour obtenir son prix
    const maillot = await prisma.maillot.findUnique({
      where: { id_maillot: data.id_maillot },
    });

    if (!maillot) {
      return res.status(404).json({ message: "Maillot non trouvé" });
    }

    const ligne = await prisma.ligneCommande.create({
      data: {
        ...(data.id_client ? { id_client: data.id_client } : {}), 
        id_maillot: data.id_maillot,
        taille_maillot: data.taille_maillot,
        quantite: data.quantite,
        prix_ht: maillot.prix_ht_maillot,
        id_tva: data.id_tva ?? 1,
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


// ✅ GET - lignes par client
ligneCommandeRouter.get("/client/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID client invalide" });

  try {
    const lignes = await prisma.ligneCommande.findMany({
      where: { id_client: id },
      include: {
        Maillot: true,
        TVA: true
      },
    });

    res.json(lignes);
  } catch (error) {
    console.error("Erreur récupération lignes client :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - total panier client 
ligneCommandeRouter.get("/client/:id/total", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID client invalide" });

  try {
    const lignes = await prisma.ligneCommande.findMany({
      where: {
        id_client: id,
        id_commande: null, 
      },
      include: {
        TVA: true
      },
    });

    const total = lignes.reduce((acc, ligne) => {
      const tva = ligne.TVA?.taux_tva ?? 20;
      const prixAvecTva = Number(ligne.prix_ht) * (1 + Number(tva) / 100);
      return acc + ligne.quantite * prixAvecTva;
    }, 0);

    res.json({ total: total.toFixed(2) + " €" });
  } catch (error) {
    console.error("Erreur calcul total panier :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});




// ✅ GET - ligne commande avec personnalisation
ligneCommandeRouter.get("/:id/details", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const ligne = await prisma.ligneCommande.findUnique({
      where: { id_lignecommande: id },
      include: {
        Maillot: true,
        TVA: true,
        LigneCommandePersonnalisation: {
          include: {
            Personnalisation: true
          }
        }
      },
    });

    if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });

    res.json(ligne);
  } catch (error) {
    console.error("Erreur récupération détails ligne commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


ligneCommandeRouter.get("/client/:id/details", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID client invalide" });

  try {
    const lignes = await prisma.ligneCommande.findMany({
      where: { id_client: id },
      include: {
        Maillot: true,
        TVA: true,
        LigneCommandePersonnalisation: {
          include: {
            Personnalisation: true,
          },
        },
        LigneCommandeReduction: {
          include: {
            Reduction: true,
          },
        },
      },
    });

    const lignesAvecTotal = lignes.map((ligne) => {
      const prixBase = Number(ligne.prix_ht);
      const personnalisations = ligne.LigneCommandePersonnalisation.map(p => Number(p.prix_personnalisation_ht));
      const totalPerso = personnalisations.reduce((sum, val) => sum + val, 0);

      const reductions = ligne.LigneCommandeReduction.map(r => Number(r.Reduction.valeur_reduction));
      const totalReduction = reductions.reduce((sum, val) => sum + val, 0);

      const totalHT = (prixBase + totalPerso - totalReduction) * ligne.quantite;
      const totalTTC = totalHT * (1 + (ligne.TVA?.taux_tva ?? 20) / 100);

      return {
        id_lignecommande: ligne.id_lignecommande,
        taille_maillot: ligne.taille_maillot,
        quantite: ligne.quantite,
        prix_ht: ligne.prix_ht,
        maillot: ligne.Maillot,
        personnalisations: ligne.LigneCommandePersonnalisation,
        reductions: ligne.LigneCommandeReduction,
        prix_total_ht: totalHT.toFixed(2),
        prix_total_ttc: totalTTC.toFixed(2),
      };
    });

    res.json(lignesAvecTotal);
  } catch (error) {
    console.error("Erreur récupération lignes client :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// ✅ DELETE - supprimer une ligne
ligneCommandeRouter.delete("/cleanup", async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - 1);

    const deleted = await prisma.ligneCommande.deleteMany({
      where: {
        id_client: null,
        date_creation: {
          lt: cutoff, 
        },
      },
    });

    res.json({ message: `${deleted.count} lignes supprimées.` });
  } catch (error) {
    console.error("Erreur nettoyage paniers invités :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

function subHours(arg0: Date, arg1: number) {
  throw new Error("Function not implemented.");
}
