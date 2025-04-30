import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const livraisonRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre en entier positif. */
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};

/*** Lecture *****************************************************************/
// Lecture : livraison liée à une commande
livraisonRouter.get("/commande/:id_commande",monMiddlewareBearer, async (req, res) => {
  try {
    const idCommande = parseId(req.params.id_commande, "id_commande");
    const livraison = await prisma.livraison.findFirst({
      where: { id_commande: idCommande },
      include: { MethodeLivraison: true, LieuLivraison: true, Livreur: true },
    });
    if (!livraison) return res.status(404).json({ message: "Livraison non trouvée" });
    res.json(livraison);
  } catch (error: any) {
    const status = error.message === "id_commande invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création (auth) *********************************************************/

livraisonRouter.post("/create", monMiddlewareBearer, async (req: Request, res: Response) => {
  const data = req.body?.data;
  if (!data) return res.status(400).json({ message: "Corps de requête manquant" });

  try {
    const commande = await prisma.commande.findUnique({ where: { id_commande: data.id_commande } });
    if (!commande) return res.status(404).json({ message: "Commande introuvable" });

    const newLivraison = await prisma.livraison.create({
      data: {
        id_commande: data.id_commande,
        id_methode_livraison: data.id_methode_livraison,
        id_lieu_livraison: data.id_lieu_livraison,
        id_livreur: data.id_livreur,
        date_livraison: data.date_livraison ? new Date(data.date_livraison) : null,
        adresse_livraison: data.adresse_livraison,
        code_postal_livraison: data.code_postal_livraison,
        ville_livraison: data.ville_livraison,
        pays_livraison: data.pays_livraison,
      },
    });
    res.status(201).json(newLivraison);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Mise à jour (auth) ******************************************************/

livraisonRouter.put("/:id_livraison", monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id_livraison, "id_livraison");
    const data = req.body?.data;
    if (!data) return res.status(400).json({ message: "Corps de requête manquant" });

    const updated = await prisma.livraison.update({
      where: { id_livraison: id },
      data: {
        id_methode_livraison: data.id_methode_livraison,
        id_lieu_livraison: data.id_lieu_livraison,
        id_livreur: data.id_livreur,
        date_livraison: data.date_livraison ? new Date(data.date_livraison) : undefined,
        adresse_livraison: data.adresse_livraison,
        code_postal_livraison: data.code_postal_livraison,
        ville_livraison: data.ville_livraison,
        pays_livraison: data.pays_livraison,
      },
    });
    res.json(updated);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Suppression (auth) ******************************************************/

livraisonRouter.delete("/:id_livraison", monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id_livraison, "id_livraison");
    await prisma.livraison.delete({ where: { id_livraison: id } });
    res.json({ message: "Livraison supprimée" });
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
