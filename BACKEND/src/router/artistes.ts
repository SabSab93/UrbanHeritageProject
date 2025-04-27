import { Router } from "express"; 
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const artisteRouter = Router();
const prisma = new PrismaClient();

// ✅ GET tous les artistes
artisteRouter.get("/", async (req, res) => {
  const artistes = await prisma.artiste.findMany();
  res.json(artistes);
});

// ✅ GET artiste par ID
artisteRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const artiste = await prisma.artiste.findUnique({
    where: { id_artiste: id },
  });

  if (!artiste) return res.status(404).json({ message: "Artiste non trouvé" });
  res.json(artiste);
});

// ✅ POST création artiste
artisteRouter.post("/create", async (req, res) => {
  try {
    const data = req.body.data;

    const newArtiste = await prisma.artiste.create({
      data: {
        nom_artiste: data.nom_artiste,
        prenom_artiste: data.prenom_artiste,
        pays_artiste: data.pays_artiste,
        date_naissance_artiste: data.date_naissance_artiste,
        site_web_artiste: data.site_web_artiste,
        url_image_artiste_1: data.url_image_artiste_1,
        url_image_artiste_2: data.url_image_artiste_2,
        url_image_artiste_3: data.url_image_artiste_3,
        description_artiste_1: data.description_artiste_1,
        description_artiste_2: data.description_artiste_2,
        description_artiste_3: data.description_artiste_3,
        url_instagram_reseau_social: data.url_instagram_reseau_social,
        url_tiktok_reseau_social: data.url_tiktok_reseau_social,

      },
    });

    res.status(201).json(newArtiste);
  } catch (error) {
    console.error("Erreur création artiste :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT modification
artisteRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const updatedArtiste = await prisma.artiste.update({
      where: { id_artiste: id }, 
      data: {
        ...data
      },
    });

    res.json(updatedArtiste);
  } catch (error) {
    console.error("Erreur update artiste :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE
artisteRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.artiste.delete({ where: { id_artiste: id } }); // <-- changé ici
    res.json({ message: "Artiste supprimé" });
  } catch (error) {
    console.error("Erreur delete artiste :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
