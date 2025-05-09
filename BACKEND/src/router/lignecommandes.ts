import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";
import { authOptional } from '../../middleware/authOptional';

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


ligneCommandeRouter.get("/:id_ligne",monMiddlewareBearer,isAdmin, async (req, res) => {
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
// src/routes/ligneCommande.ts


ligneCommandeRouter.post(
  '/create',
  authOptional,       // ← autorise invités et connectés
  async (req: any, res) => {
    const data = req.body?.data;
    if (!data) return res.status(400).json({ message: 'Corps manquant' });

    try {
      const maillot = await prisma.maillot.findUnique({
        where: { id_maillot: data.id_maillot }
      });
      if (!maillot) return res.status(404).json({ message: 'Maillot non trouvé' });

      const newLine = await prisma.ligneCommande.create({
        data: {
          // id_client n’est fourni QUE si l’invité s’est connecté
          ...(data.id_client ? { id_client: data.id_client } : {}),
          id_maillot     : data.id_maillot,
          taille_maillot : data.taille_maillot,
          quantite       : data.quantite,
          prix_ht        : maillot.prix_ht_maillot,
          id_tva         : data.id_tva ?? 1,
        }
      });
      return res.status(201).json(newLine);
    } catch {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);


ligneCommandeRouter.put(
  '/:id_ligne',
  authOptional,   // décode le JWT si présent, ne bloque jamais
  async (req: any, res: Response) => {
    try {
      // 1) Extraction & logs (optionnel pour debug)
      const id       = parseId(req.params.id_ligne, 'id_lignecommande');
      const payload  = req.decoded as any;
      console.log('Headers.Authorization =', req.headers.authorization);
      console.log('req.decoded =', payload);

      // 2) Récupérer l’ID client depuis le token (futur claim ou actuel)
      const idClient =
        payload?.id_client     /* si tu utilises ce claim */
        ?? payload?.idf_client /* sinon ton claim */
        ?? null;
      console.log('idClient (JWT) =', idClient);

      // 3) Charger la ligne existante
      const ligne = await prisma.ligneCommande.findUnique({
        where: { id_lignecommande: id }
      });
      if (!ligne) {
        return res.status(404).json({ message: 'Ligne non trouvée' });
      }

      // 4) Autorisation : 
      //    – ok si invité ET ligne.id_client===null 
      //    – ok si connecté ET ligne.id_client===idClient
      const forbidden =
        ligne.id_client !== null &&
        ligne.id_client !== idClient;
      if (forbidden) {
        return res.status(403).json({ message: 'Accès interdit' });
      }

      // 5) Immuabilité après commande validée
      if (ligne.id_commande !== null) {
        return res.status(400).json({ message: 'Commande déjà validée' });
      }

      // 6) Mise à jour
      const updated = await prisma.ligneCommande.update({
        where: { id_lignecommande: id },
        data: req.body.data    // { quantite?:…, taille_maillot?:… }
      });

      return res.json(updated);
    } catch (err: any) {
      console.error('💥 Erreur PUT /lignecommande:', err);
      const status = err.message?.includes('invalide') ? 400 : 500;
      return res.status(status).json({ message: err.message ?? 'Erreur serveur' });
    }
  }
);

/*** Lecture côté client *****************************************************/
//Lecture : lignes d’un client
ligneCommandeRouter.get(
  "/client/:id_client/details",
  monMiddlewareBearer,
  async (req, res) => {
    try {
      const id = parseId(req.params.id_client, "id_client");
      const lignes = await prisma.ligneCommande.findMany({
        where: { id_client: id },
        include: {
          Maillot: true,
          TVA: true,
          LigneCommandePersonnalisation: {
            include: { Personnalisation: true },
          },
        },
      });
      res.json(lignes);
    } catch (error: any) {
      const status = error.message.includes("invalide") ? 400 : 500;
      res.status(status).json({ message: error.message ?? "Erreur serveur" });
    }
  }
);

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

ligneCommandeRouter.delete(
  '/:id_ligne/client',
  authOptional,   // ← IMPORTANT
  async (req: any, res: Response) => {
    const id      = parseId(req.params.id_ligne, 'id_lignecommande');
    // récupère le bon champ du token (ai-je appelé idf_client dans le JWT ?)
    const idClient =
      (req.decoded as any)?.id_client
      ?? (req.decoded as any)?.idf_client
      ?? null;

    const ligne = await prisma.ligneCommande.findUnique({
      where: { id_lignecommande: id }
    });
    if (!ligne) return res.status(404).json({ message: 'Ligne non trouvée' });

    // autorisé si :
    //  - invité ET ligne.id_client===null
    //  - ou connecté ET ligne.id_client===idClient
    const interdit =
      ligne.id_client !== null &&
      ligne.id_client !== idClient;
    if (interdit) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    if (ligne.id_commande !== null) {
      return res.status(400).json({ message: 'Commande déjà validée' });
    }

    await prisma.ligneCommande.delete({ where: { id_lignecommande: id } });
    return res.sendStatus(204);
  }
);

