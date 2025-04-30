import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const ligneCommandePersonnalisationRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};

/*** Lecture : toutes les personnalisations *********************************/
ligneCommandePersonnalisationRouter.get("/", async (_req, res) => {
  const all = await prisma.ligneCommandePersonnalisation.findMany({
    include: { Personnalisation: true, LigneCommande: true },
  });
  res.json(all);
});

/*** Lecture : personnalisations par ligne **********************************/
ligneCommandePersonnalisationRouter.get("/:id_lignecommande", async (req, res) => {
  try {
    const id = parseId(req.params.id_lignecommande, "id_lignecommande");
    const lignes = await prisma.ligneCommandePersonnalisation.findMany({
      where: { id_lignecommande: id },
      include: { Personnalisation: true },
    });
    if (lignes.length === 0)
      return res.status(404).json({ message: "Aucune personnalisation trouvée" });
    res.json(lignes);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création d’une personnalisation ***************************************/
ligneCommandePersonnalisationRouter.post("/create", async (req: Request, res: Response) => {
  const { id_lignecommande, id_personnalisation } = req.body?.data || {};
  if (!id_lignecommande || !id_personnalisation)
    return res.status(400).json({ message: "Champs requis manquants" });

  try {
    const perso = await prisma.personnalisation.findUnique({ where: { id_personnalisation } });
    if (!perso) return res.status(404).json({ message: "Personnalisation non trouvée" });

    const created = await prisma.ligneCommandePersonnalisation.create({
      data: {
        id_lignecommande,
        id_personnalisation,
        prix_personnalisation_ht: perso.prix_ht,
      },
    });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Mise à jour d’une personnalisation *************************************/
ligneCommandePersonnalisationRouter.put("/:id_lignecommande", async (req, res) => {
  try {
    const idLigne = parseId(req.params.id_lignecommande, "id_lignecommande");
    const { id_personnalisation, prix_personnalisation_ht } = req.body?.data || {};
    if (!id_personnalisation)
      return res.status(400).json({ message: "id_personnalisation requis" });

    const updated = await prisma.ligneCommandePersonnalisation.update({
      where: {
        id_lignecommande_id_personnalisation: {
          id_lignecommande: idLigne,
          id_personnalisation,
        },
      },
      data: { prix_personnalisation_ht },
    });
    res.json(updated);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Suppression d’une personnalisation *************************************/
ligneCommandePersonnalisationRouter.delete(
  "/:id_lignecommande/:id_personnalisation",
  async (req, res) => {
    try {
      const idLigne = parseId(req.params.id_lignecommande, "id_lignecommande");
      const idPerso = parseId(req.params.id_personnalisation, "id_personnalisation");

      await prisma.ligneCommandePersonnalisation.delete({
        where: {
          id_lignecommande_id_personnalisation: {
            id_lignecommande: idLigne,
            id_personnalisation: idPerso,
          },
        },
      });
      res.json({ message: "Personnalisation supprimée" });
    } catch (error: any) {
      const status = error.message.includes("invalide") ? 400 : 500;
      res.status(status).json({ message: error.message ?? "Erreur serveur" });
    }
  }
);
