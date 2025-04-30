import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

export const ligneCommandeRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};

/*** Lecture générale  ********************************************************/
ligneCommandeRouter.get("/",monMiddlewareBearer,isAdmin, async (_req, res) => {
  const lignes = await prisma.ligneCommande.findMany();
  res.json(lignes);
});


ligneCommandeRouter.get("/:id_ligne", async (req, res) => {
  try {
    const id = parseId(req.params.id_ligne, "id_lignecommande");
    const ligne = await prisma.ligneCommande.findUnique({ where: { id_lignecommande: id } });
    if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
    res.json(ligne);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

//Lecture : détail complet d’une ligne
ligneCommandeRouter.get("/:id_ligne/details", async (req, res) => {
  try {
    const id = parseId(req.params.id_ligne, "id_lignecommande");
    const ligne = await prisma.ligneCommande.findUnique({
      where: { id_lignecommande: id },
      include: {
        Maillot: true,
        TVA: true,
        LigneCommandePersonnalisation: { include: { Personnalisation: true } },
      },
    });
    if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
    res.json(ligne);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Création & mise à jour  **************************************************/
ligneCommandeRouter.post("/create", async (req: Request, res: Response) => {
  const data = req.body?.data;
  if (!data) return res.status(400).json({ message: "Corps de requête manquant" });

  try {
    const maillot = await prisma.maillot.findUnique({ where: { id_maillot: data.id_maillot } });
    if (!maillot) return res.status(404).json({ message: "Maillot non trouvé" });

    const newLine = await prisma.ligneCommande.create({
      data: {
        ...(data.id_client ? { id_client: data.id_client } : {}),
        id_maillot: data.id_maillot,
        taille_maillot: data.taille_maillot,
        quantite: data.quantite,
        prix_ht: maillot.prix_ht_maillot,
        id_tva: data.id_tva ?? 1,
      },
    });
    res.status(201).json(newLine);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

ligneCommandeRouter.put("/:id_ligne", async (req, res) => {
  try {
    const id = parseId(req.params.id_ligne, "id_lignecommande");
    const updated = await prisma.ligneCommande.update({ where: { id_lignecommande: id }, data: req.body.data });
    res.json(updated);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});


/*** Lecture côté client *****************************************************/
//Lecture : lignes d’un client
ligneCommandeRouter.get("/client/:id_client",monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id_client, "id_client");
    const lignes = await prisma.ligneCommande.findMany({
      where: { id_client: id },
      include: { Maillot: true, TVA: true },
    });
    res.json(lignes);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

// Lecture : total panier client
ligneCommandeRouter.get("/client/:id_client/total",monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id_client, "id_client");
    const lignes = await prisma.ligneCommande.findMany({ where: { id_client: id, id_commande: null }, include: { TVA: true } });
    const total = lignes.reduce((sum, l) => {
      const tva = l.TVA?.taux_tva ?? 20;
      const prixTtc = Number(l.prix_ht) * (1 + tva / 100);
      return sum + l.quantite * prixTtc;
    }, 0);
    res.json({ total: total.toFixed(2) + " €" });
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

// Lecture : panier client 
ligneCommandeRouter.get("/client/:id_client/panier",monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id_client, "id_client");
    const panier = await prisma.ligneCommande.findMany({
      where: { id_client: id, id_commande: null },
      include: { Maillot: true, TVA: true, LigneCommandePersonnalisation: { include: { Personnalisation: true } } },
      orderBy: { date_creation: "asc" },
    });
    res.json(panier);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

// Lecture : lignes client (param all) 
ligneCommandeRouter.get("/client/:id_client/lignes",monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id_client, "id_client");
    const all = req.query.all === "true";
    const where: any = { id_client: id };
    if (!all) where.id_commande = null;

    const lignes = await prisma.ligneCommande.findMany({ where, include: { Maillot: true, TVA: true }, orderBy: { date_creation: "asc" } });
    res.json(lignes);
  } catch (error: any) {
    const status = error.message.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});


/*** Modification par le client ************************************************/
ligneCommandeRouter.put("/:id_ligne", async (req: any, res) => {
  try {
    const id = parseId(req.params.id_ligne, "id_lignecommande");
    const idClient = req.decoded.id_client;
    const data = req.body?.data;

    const ligne = await prisma.ligneCommande.findUnique({ where: { id_lignecommande: id } });
    if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
    if (ligne.id_client !== idClient) return res.status(403).json({ message: "Accès interdit" });
    if (ligne.id_commande !== null) return res.status(400).json({ message: "Commande déjà validée" });

    const updated = await prisma.ligneCommande.update({
      where: { id_lignecommande: id },
      data,
    });

    res.json(updated);
  } catch (error: any) {
    const status = error.message?.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Nettoyage des paniers invités  ***********************************/
// Suppression : paniers invités expirés 
ligneCommandeRouter.delete("/cleanup", async (_req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - 1);
    const deleted = await prisma.ligneCommande.deleteMany({ where: { id_client: null, date_creation: { lt: cutoff } } });
    res.json({ message: `${deleted.count} lignes supprimées` });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Suppression d'une ligne du panier par le client ***************************/
ligneCommandeRouter.delete("/:id_ligne/client", async (req: any, res) => {
  try {
    const id = parseId(req.params.id_ligne, "id_lignecommande");
    const idClient = req.decoded.id_client;

    const ligne = await prisma.ligneCommande.findUnique({ where: { id_lignecommande: id } });
    if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
    if (ligne.id_client !== idClient) return res.status(403).json({ message: "Accès interdit" });
    if (ligne.id_commande !== null) return res.status(400).json({ message: "Commande déjà validée" });

    await prisma.ligneCommande.delete({ where: { id_lignecommande: id } });
    res.json({ message: "Ligne supprimée du panier" });
  } catch (error: any) {
    const status = error.message?.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
