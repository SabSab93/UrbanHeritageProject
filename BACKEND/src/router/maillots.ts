import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

export const maillotRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
const parseLimit = (raw: any, fallback = 8): number => {
  const parsed = parseInt(raw as string, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed > 50 ? 50 : parsed;
};

const parseId = (raw: any): number => {
  const parsed = parseInt(raw as string, 10);
  if (Number.isNaN(parsed) || parsed <= 0) throw new Error("ID invalide");
  return parsed;
};

/*** Création (Admin) *********************************************************/
maillotRouter.post(
  '/create',
  monMiddlewareBearer,
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const maillotData = req.body?.data;
      if (!maillotData) {
        return res.status(400).json({ message: 'Corps de requête manquant' });
      }

      const requiredFields = [
        'nom_maillot',
        'pays_maillot',
        'id_artiste',
        'id_association',
        'prix_ht_maillot',
      ];
      const missing = requiredFields.filter(
        f => maillotData[f] === undefined || maillotData[f] === null
      );
      if (missing.length) {
        return res
          .status(400)
          .json({ message: `Champs manquants : ${missing.join(', ')}` });
      }
      if (typeof maillotData.prix_ht_maillot !== 'number') {
        return res
          .status(400)
          .json({ message: 'prix_ht_maillot doit être un nombre' });
      }

      const createdMaillot = await prisma.maillot.create({
        data: {
          id_artiste:            maillotData.id_artiste,
          id_association:        maillotData.id_association,
          id_tva:                maillotData.id_tva ?? 1,
          nom_maillot:           maillotData.nom_maillot,
          pays_maillot:          maillotData.pays_maillot,
          description_maillot:   maillotData.description_maillot,
          composition_maillot:   maillotData.composition_maillot,
          url_image_maillot_1:   maillotData.url_image_maillot_1,
          url_image_maillot_2:   maillotData.url_image_maillot_2,
          url_image_maillot_3:   maillotData.url_image_maillot_3,
          origine:               maillotData.origine,
          tracabilite:           maillotData.tracabilite,
          entretien:             maillotData.entretien,
          prix_ht_maillot:       maillotData.prix_ht_maillot,
        },
      });

      return res.status(201).json(createdMaillot);
    } catch (err) {
      console.error('POST /maillot/create', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

/*** Routes spécifiques : coup‑de‑cœur & nouveautés ***************************/
maillotRouter.get("/coup-de-coeur", async (req, res) => {
  const limit = parseLimit(req.query.limit);
  try {
    const bestSellers = await prisma.maillot.findMany({
      orderBy: { quantite_vendue: "desc" },
      take: limit,
    });

    res.json(bestSellers);
  } catch (error) {
    console.error("GET /maillot/coup-de-coeur", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

maillotRouter.get("/nouveautes", async (req, res) => {
  const limit = parseLimit(req.query.limit);
  try {
    const latestMaillots = await prisma.maillot.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
    });
    res.json(latestMaillots);
  } catch (error) {
    console.error("GET /maillot/nouveautes", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Lecture standard ********************************************************/
maillotRouter.get("/", async (_req, res) => {
  const maillots = await prisma.maillot.findMany();
  res.json(maillots);
});

maillotRouter.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const maillot = await prisma.maillot.findUnique({
      where: { id_maillot: id },
    });
    if (!maillot)
      return res.status(404).json({ message: "Maillot non trouvé" });
    res.json(maillot);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Mise à jour & Suppression (Admin) ***************************************/
maillotRouter.put("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const updatedMaillot = await prisma.maillot.update({
      where: { id_maillot: id },
      data: req.body.data,
    });
    res.json(updatedMaillot);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

maillotRouter.delete("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    await prisma.maillot.delete({ where: { id_maillot: id } });
    res.json({ message: "Maillot supprimé" });
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
