import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


export const maillotRouter = Router();
const prisma = new PrismaClient();

/***Utils***/

const parseLimit = (raw: any, def = 8): number => {
  const n = parseInt(raw as string, 10);
  if (Number.isNaN(n) || n < 1) return def;
  return n > 50 ? 50 : n;
};

const parseId = (raw: any): number => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error("ID invalide");
  return id;
};

/***Création***/

maillotRouter.post("/create", async (req: Request, res: Response) => {
  try {
    const d = req.body?.data;
    if (!d)
      return res.status(400).json({ message: "Corps de requête manquant" });

    const required = ["nom_maillot", "pays_maillot", "id_artiste", "id_association"];
    const missing = required.filter((k) => !d[k]);
    if (missing.length)
      return res.status(400).json({ message: `Champs manquants: ${missing.join(", ")}` });

    if (typeof d.prix_ht_maillot !== "number")
      return res.status(400).json({ message: "prix_ht_maillot doit être un nombre" });

    const nouveau = await prisma.maillot.create({ data: { ...d, id_tva: d.id_tva ?? 1 } });
    return res.status(201).json(nouveau);
  } catch (err) {
    console.error("POST /maillots/create", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/***Routes spécifiques : coup‑de‑cœur & nouveautés***/

maillotRouter.get("/coup-de-coeur", async (req, res) => {
  const limit = parseLimit(req.query.limit);
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
    res.json(ids.map((id) => maillots.find((m) => m!.id_maillot === id)));
  } catch (err) {
    console.error("GET /maillots/coup-de-coeur", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

maillotRouter.get("/nouveautes", async (req, res) => {
  const limit = parseLimit(req.query.limit);
  try {
    const latest = await prisma.maillot.findMany({ orderBy: { created_at: "desc" }, take: limit });
    res.json(latest);
  } catch (err) {
    console.error("GET /maillots/nouveautes", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/***Lecture standard***/

maillotRouter.get("/", async (_req, res) => {
  const maillots = await prisma.maillot.findMany();
  res.json(maillots);
});

maillotRouter.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const maillot = await prisma.maillot.findUnique({ where: { id_maillot: id } });
    if (!maillot) return res.status(404).json({ message: "Maillot non trouvé" });
    res.json(maillot);
  } catch (err: any) {
    const msg = err.message === "ID invalide" ? err.message : "Erreur serveur";
    res.status(msg === "ID invalide" ? 400 : 500).json({ message: msg });
  }
});

/***Mise à jour & Suppression***/

maillotRouter.put("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const updated = await prisma.maillot.update({ where: { id_maillot: id }, data: req.body.data });
    res.json(updated);
  } catch (err: any) {
    const code = err.message === "ID invalide" ? 400 : 500;
    res.status(code).json({ message: code === 400 ? err.message : "Erreur serveur" });
  }
});

maillotRouter.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    await prisma.maillot.delete({ where: { id_maillot: id } });
    res.json({ message: "Maillot supprimé" });
  } catch (err: any) {
    const code = err.message === "ID invalide" ? 400 : 500;
    res.status(code).json({ message: code === 400 ? err.message : "Erreur serveur" });
  }
});