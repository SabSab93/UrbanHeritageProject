import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../checkToken";

export const maillotRouter = Router();
const prisma = new PrismaClient();


// POST
maillotRouter.post("/create", async (req, res) => {
    try {
      const data = req.body.data;
  
      // Tu peux ajouter ici une validation basique si nécessaire
      if (
        !data ||
        !data.id_tva ||
        !data.nom_maillot ||
        !data.pays_maillot ||
        typeof data.prix_ht_maillot !== "number"
      ) {
        return res.status(400).json({ message: "Données incomplètes" });
      }
  
      const newMaillot = await prisma.maillot.create({
        data: {
          id_tva: data.id_tva,
          nom_maillot: data.nom_maillot,
          pays_maillot: data.pays_maillot,
          description_maillot: data.description_maillot,
          composition_maillot: data.composition_maillot,
          url_image_maillot_1: data.url_image_maillot_1,
          url_image_maillot_2: data.url_image_maillot_2,
          url_image_maillot_3: data.url_image_maillot_3,
          origine: data.origine,
          tracabilite: data.tracabilite,
          entretien: data.entretien,
          prix_ht_maillot: data.prix_ht_maillot,
        },
      });
  
      return res.status(201).json(newMaillot);
    } catch (error) {
      console.error("Erreur lors de la création du maillot :", error);
      return res.status(500).json({ message: "Erreur serveur lors de la création du maillot" });
    }
  });

// GET
maillotRouter.get("/", async (req, res) => {
  const maillots = await prisma.maillot.findMany();
  res.json(maillots);
})


//GET ID
maillotRouter.get("/:id", async (req, res) => {
  const maillotId = parseInt(req.params.id_maillot);

  if (isNaN(maillotId)) {
    return res.status(400).json({ message: "Invalid maillot ID" });
  }

  const maillot = await prisma.maillot.findUnique({
    where: { id_maillot: maillotId },
  });

  if (!maillot) {
    return res.status(404).json({ message: "maillot not found" });
  }

  res.json(maillot);
});


// //DELETE
// maillotRouter.delete("/:id", async (req, res) => {
//   const instrumentId = parseInt(req.params.id);

//   if (isNaN(instrumentId)) {
//     return res.status(400).json({ message: "Invalid maillot ID" });
//   }

//   const maillot = await prisma.maillot.findUnique({
//     where: { id: instrumentId },
//   });

//   if (!maillot) {
//     return res.status(404).json({ message: "maillot not found" });
//   }

//   await prisma.maillot.delete({
//     where: { id: instrumentId },
//   });

//   res.json({ message: "maillot deleted" });
// });


// //PUT 
// maillotRouter.put("/:id", async (req, res) => {
//   const instrumentId = parseInt(req.params.id);

//   if (isNaN(instrumentId)) {
//     return res.status(400).json({ message: "Invalid maillot ID" });
//   }

//   const maillot = await prisma.maillot.findUnique({
//     where: { id: instrumentId },
//   });

//   if (!maillot) {
//     return res.status(404).json({ message: "maillot not found" });
//   }

//   const updateinstrumentId = await prisma.maillot.update({
//     where: { id: instrumentId },
//     data: {
//       name:req.body.data.name,
//       poids:req.body.data.poids,
//       couleur:req.body.data.couleur,
//       prix:req.body.data.prix
//     },
//   });

//   res.json(updateinstrumentId);
// });