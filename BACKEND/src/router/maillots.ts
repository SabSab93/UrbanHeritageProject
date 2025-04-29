import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const maillotRouter = Router();
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                  Création                                  */
/* -------------------------------------------------------------------------- */

maillotRouter.post("/create", async (req, res) => {
  try {
    const d = req.body.data;
    if (!d || !d.nom_maillot || !d.pays_maillot || typeof d.prix_ht_maillot !== "number" || !d.id_artiste || !d.id_association) {
      return res.status(400).json({ message: "Données incomplètes" });
    }
    const nouveau = await prisma.maillot.create({
      data: {
        id_artiste: d.id_artiste,
        id_association: d.id_association,
        id_tva: d.id_tva ?? 1,
        nom_maillot: d.nom_maillot,
        pays_maillot: d.pays_maillot,
        description_maillot: d.description_maillot,
        composition_maillot: d.composition_maillot,
        url_image_maillot_1: d.url_image_maillot_1,
        url_image_maillot_2: d.url_image_maillot_2,
        url_image_maillot_3: d.url_image_maillot_3,
        origine: d.origine,
        tracabilite: d.tracabilite,
        entretien: d.entretien,
        prix_ht_maillot: d.prix_ht_maillot,
      },
    });
    res.status(201).json(nouveau);
  } catch (err) {
    console.error("POST /maillots/create", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------------------------- */
/*                Routes spécifiques : coup‑de‑cœur & nouveautés              */
/* -------------------------------------------------------------------------- */

maillotRouter.get("/coup-de-coeur", async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  try {
    const best = await prisma.ligneCommande.groupBy({
      by: ["id_maillot"],
      where: { Commande: { statut_paiement: "paye" } },
      _sum: { quantite: true },
      orderBy: { _sum: { quantite: "desc" } },
      take: limit,
    });
    const ids = best.map((b) => b.id_maillot);
    const maillots = await prisma.maillot.findMany({ where: { id_maillot: { in: ids } } });
    res.json(ids.map((id) => maillots.find((m) => m.id_maillot === id)));
  } catch (err) {
    console.error("GET /maillots/coup-de-coeur", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

maillotRouter.get("/nouveautes", async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  try {
    const latest = await prisma.maillot.findMany({ orderBy: { created_at: "desc" }, take: limit });
    res.json(latest);
  } catch (err) {
    console.error("GET /maillots/nouveautes", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------------------------- */
/*                              Lecture standard                              */
/* -------------------------------------------------------------------------- */

maillotRouter.get("/", async (_req, res) => {
  const maillots = await prisma.maillot.findMany();
  res.json(maillots);
});

// Seuls les nombres sont acceptés pour :id → évite le conflit avec /coup-de-coeur
maillotRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const maillot = await prisma.maillot.findUnique({ where: { id_maillot: id } });
  if (!maillot) return res.status(404).json({ error: "Maillot non trouvé" });
  res.json(maillot);
});

/* -------------------------------------------------------------------------- */
/*                        Mise à jour & Suppression                           */
/* -------------------------------------------------------------------------- */

maillotRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const updated = await prisma.maillot.update({ where: { id_maillot: id }, data: req.body.data });
    res.json(updated);
  } catch (err) {
    console.error("PUT /maillots/:id", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

maillotRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.maillot.delete({ where: { id_maillot: id } });
    res.json({ message: "Maillot supprimé" });
  } catch (err) {
    console.error("DELETE /maillots/:id", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
