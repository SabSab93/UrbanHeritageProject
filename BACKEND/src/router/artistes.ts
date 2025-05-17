import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";

export const artisteRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre d’URL en entier positif. */
const parseId = (raw: any): number => {
  const parsed = parseInt(raw as string, 10);
  if (Number.isNaN(parsed) || parsed <= 0) throw new Error("ID invalide");
  return parsed;
};

/*** Création (Admin) *********************************************************/
artisteRouter.post(
  "/create",
  monMiddlewareBearer,
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const artisteData = req.body?.data;
      if (!artisteData)
        return res.status(400).json({ message: "Corps de requête manquant" });

      const requiredFields = ["nom_artiste", "prenom_artiste", "pays_artiste"];
      const missingFields = requiredFields.filter(
        (field) => !artisteData[field]
      );
      if (missingFields.length)
        return res.status(400).json({
          message: `Champs manquants : ${missingFields.join(", ")}`,
        });

      const newArtiste = await prisma.artiste.create({
        data: {
          nom_artiste: artisteData.nom_artiste,
          prenom_artiste: artisteData.prenom_artiste,
          pays_artiste: artisteData.pays_artiste,
          date_naissance_artiste: artisteData.date_naissance_artiste,
          site_web_artiste: artisteData.site_web_artiste,
          url_image_artiste_1: artisteData.url_image_artiste_1,
          url_image_artiste_2: artisteData.url_image_artiste_2,
          url_image_artiste_3: artisteData.url_image_artiste_3,
          description_artiste_1: artisteData.description_artiste_1,
          description_artiste_2: artisteData.description_artiste_2,
          description_artiste_3: artisteData.description_artiste_3,
          url_instagram_reseau_social: artisteData.url_instagram_reseau_social,
          url_tiktok_reseau_social: artisteData.url_tiktok_reseau_social,
        },
      });

      res.status(201).json(newArtiste);
    } catch (error) {
      console.error("POST /artiste/create", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

/*** Lecture standard  *******************************************************/
artisteRouter.get("/", async (_req, res) => {
  const artistes = await prisma.artiste.findMany();
  res.json(artistes);
});

// src/routes/artiste.router.ts

artisteRouter.get("/:id([0-9]+)", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    const artiste = await prisma.artiste.findUnique({
      where: { id_artiste: id },
      include: {
        Maillots: {
          select: {
            id_maillot: true,
            nom_maillot: true,
            url_image_maillot_1: true,
          }
        }
      }
    });

    if (!artiste) {
      return res.status(404).json({ message: "Artiste non trouvé" });
    }

    res.json(artiste);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});


/*** Mise à jour & Suppression (Admin) ***************************************/
artisteRouter.put("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const updatedArtiste = await prisma.artiste.update({
      where: { id_artiste: id },
      data: req.body.data,
    });
    res.json(updatedArtiste);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

artisteRouter.delete("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    await prisma.artiste.delete({ where: { id_artiste: id } });
    res.json({ message: "Artiste supprimé" });
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
