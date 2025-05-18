import { Router } from "express";
import {
  PrismaClient,
  statut_reduction_type_enum,
  type_reduction_enum,
} from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";

export const reductionRouter = Router();
const prisma = new PrismaClient();

/*** Utils **********************************************************/
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};
const parseFrDate = (raw: string): Date | undefined => {
  const m = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (!m) return undefined;
  const [, d, M, y] = m;
  return new Date(`${y}-${M}-${d}T00:00:00Z`);
};

/*** Lecture **********************************************************/

reductionRouter.get("/public/actives", async (_req, res) => {
  const now = new Date();
  try {
    const active = await prisma.reduction.findMany({
      where: {
        statut_reduction: statut_reduction_type_enum.active,
        date_debut_reduction: { lte: now },
        date_fin_reduction: { gte: now },
      },
      orderBy: { date_debut_reduction: "asc" },
    });
    res.json(active);
  } catch (error) {
    console.error("Erreur /public/actives :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Toutes les réductions
reductionRouter.get("/", monMiddlewareBearer, isAdmin, async (_req, res) => {
  try {
    const list = await prisma.reduction.findMany();
    res.json(list);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Réduction par ID
reductionRouter.get("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id, "id_reduction");
    const one = await prisma.reduction.findUnique({ where: { id_reduction: id } });
    if (!one) return res.status(404).json({ message: "Réduction non trouvée" });
    res.json(one);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création **********************************************************/

reductionRouter.post("/create", monMiddlewareBearer, isAdmin, async (req, res) => {
  const d = req.body?.data;
  try {
    const payload: any = {
      ...d,
      statut_reduction:
        statut_reduction_type_enum[
          d.statut_reduction as keyof typeof statut_reduction_type_enum
        ],
      type_reduction:
        type_reduction_enum[
          d.type_reduction as keyof typeof type_reduction_enum
        ],
    };

    if (d.date_debut_reduction)
      payload.date_debut_reduction =
        parseFrDate(d.date_debut_reduction) ?? d.date_debut_reduction;

    if (d.date_fin_reduction)
      payload.date_fin_reduction =
        parseFrDate(d.date_fin_reduction) ?? d.date_fin_reduction;

    const created = await prisma.reduction.create({ data: payload });
    res.status(201).json(created);
  } catch (error) {
    console.error("/reduction/create", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Mise à jour ***************************************************/

reductionRouter.put("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  const body = req.body?.data;
  try {
    const id = parseId(req.params.id, "id_reduction");

    const payload: any = { ...body };

    if (body?.statut_reduction) {
      payload.statut_reduction =
        statut_reduction_type_enum[
          body.statut_reduction as keyof typeof statut_reduction_type_enum
        ];
    }
    if (body?.type_reduction) {
      payload.type_reduction =
        type_reduction_enum[
          body.type_reduction as keyof typeof type_reduction_enum
        ];
    }

    if (body?.date_debut_reduction)
      payload.date_debut_reduction =
        parseFrDate(body.date_debut_reduction) ?? body.date_debut_reduction;

    if (body?.date_fin_reduction)
      payload.date_fin_reduction =
        parseFrDate(body.date_fin_reduction) ?? body.date_fin_reduction;

    const updated = await prisma.reduction.update({
      where: { id_reduction: id },
      data: payload,
    });

    res.json(updated);
  } catch (error: any) {
    console.error("/reduction/:id", error);
    const status = error.message?.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});


/***Suppression ***********************************************/

reductionRouter.delete("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id, "id_reduction");
    await prisma.reduction.delete({ where: { id_reduction: id } });
    res.json({ message: "Réduction supprimée" });
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
