import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";
import { authOptional } from '../middleware/authOptional';

export const ligneCommandeRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
const parseId = (raw: any, label = "ID") => {
  const id = parseInt(raw as string, 10);
  if (Number.isNaN(id) || id <= 0) throw new Error(`${label} invalide`);
  return id;
};

/*** Lecture générale  ********************************************************/
/*** GET all lignes (admin) ***/
ligneCommandeRouter.get(
  "/",
  monMiddlewareBearer,
  isAdmin,
  async (_req, res) => {
    const lignes = await prisma.ligneCommande.findMany();
    res.json(lignes);
  }
);
ligneCommandeRouter.get(
  "/:id_ligne",
  monMiddlewareBearer,
  isAdmin,
  async (req, res) => {
    try {
      const id = parseId(req.params.id_ligne, "id_lignecommande");
      const ligne = await prisma.ligneCommande.findUnique({
        where: { id_lignecommande: id },
      });
      if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
      res.json(ligne);
    } catch (err: any) {
      const status = err.message.includes("invalide") ? 400 : 500;
      res.status(status).json({ message: err.message ?? "Erreur serveur" });
    }
  }
);

ligneCommandeRouter.get(
  "/:id_ligne/details",
  authOptional,
  async (req, res) => {
    try {
      const id = parseId(req.params.id_ligne, "id_lignecommande");
      const ligne = await prisma.ligneCommande.findUnique({
        where: { id_lignecommande: id },
        include: {
          Maillot: true,
          TVA: true,
          Personnalisation: true,
        },
      });
      if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });

      // calcul totalPrixHt si besoin
      const totalPrixHt = (
        Number(ligne.prix_ht)
      ).toFixed(2);

      res.json({ ...ligne, totalPrixHt });
    } catch (err: any) {
      const status = err.message.includes("invalide") ? 400 : 500;
      res.status(status).json({ message: err.message ?? "Erreur serveur" });
    }
  }
);

/*** Création & mise à jour  **************************************************/

ligneCommandeRouter.post(
  "/create",
  authOptional,
  async (req: Request, res: Response) => {
    const data = (req.body as any).data;
    if (!data) return res.status(400).json({ message: "Corps manquant" });

    try {
      // Vérifier le maillot
      const maillot = await prisma.maillot.findUnique({
        where: { id_maillot: data.id_maillot },
      });
      if (!maillot) return res.status(404).json({ message: "Maillot non trouvé" });

      // Détecter personnalisation
      const hasPerso = data.id_personnalisation != null;
      let prixPerso = 0;
      if (hasPerso) {
        const perso = await prisma.personnalisation.findUnique({
          where: { id_personnalisation: data.id_personnalisation },
          select: { prix_ht: true },
        });
        if (!perso) return res.status(404).json({ message: "Personnalisation non trouvée" });
        prixPerso = Number(perso.prix_ht);
      }

      // Création
      const newLine = await prisma.ligneCommande.create({
        data: {
          ...(data.id_client ? { id_client: data.id_client } : {}),
          id_maillot: data.id_maillot,
          taille_maillot: data.taille_maillot,
          quantite: data.quantite,
          prix_ht: maillot.prix_ht_maillot + prixPerso,
          id_tva: data.id_tva ?? 1,
          ligne_commande_personnalisee: hasPerso,
          id_personnalisation: hasPerso ? data.id_personnalisation : null,
          valeur_personnalisation: hasPerso ? data.valeur_personnalisation : null,
          couleur_personnalisation: hasPerso ? data.couleur_personnalisation : null,
        },
      });

      res.status(201).json(newLine);
    } catch (err: any) {
      console.error("💥 Erreur POST /create:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);


/*** PUT /api/lignecommande/:id_ligne ****************************************/

ligneCommandeRouter.put(
  "/:id_ligne",
  authOptional,
  async (req: any, res: Response) => {
    try {
      const idLigne = parseId(req.params.id_ligne, "id_lignecommande");
      const { id_personnalisation, valeur_personnalisation, couleur_personnalisation } =
        req.body.data || {};

      // On ne traite QUE l’ajout de personnalisation ici
      if (id_personnalisation == null) {
        return res.status(400).json({ message: "id_personnalisation requis" });
      }

      // Vérif que la ligne existe
      const ligne = await prisma.ligneCommande.findUnique({
        where: { id_lignecommande: idLigne },
      });
      if (!ligne) {
        return res.status(404).json({ message: "Ligne non trouvée" });
      }
      if (ligne.id_commande != null) {
        return res.status(400).json({ message: "Commande déjà validée" });
      }

      // Vérif que la perso existe et prendre son prix
      const perso = await prisma.personnalisation.findUnique({
        where: { id_personnalisation },
        select: { prix_ht: true },
      });
      if (!perso) {
        return res.status(404).json({ message: "Personnalisation non trouvée" });
      }

      // Récupérer prix du maillot
      const m = await prisma.maillot.findUnique({
        where: { id_maillot: ligne.id_maillot },
        select: { prix_ht_maillot: true },
      });
      const prixMaillot = m ? Number(m.prix_ht_maillot) : 0;

      // Mise à jour directe
      const updated = await prisma.ligneCommande.update({
        where: { id_lignecommande: idLigne },
        data: {
          ligne_commande_personnalisee: true,
          id_personnalisation,
          valeur_personnalisation,
          couleur_personnalisation,
          prix_ht: prixMaillot + Number(perso.prix_ht),
        },
      });

      return res.json(updated);
    } catch (err: any) {
      console.error(err);
      const status = err.message.includes("invalide") ? 400 : 500;
      return res.status(status).json({ message: err.message ?? "Erreur serveur" });
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
          Personnalisation: true,
        },
        orderBy: { date_creation: "asc" },
      });

      res.json(
        lignes.map(ligne => ({
          ...ligne,
          totalTtc: (
            Number(ligne.prix_ht) *
            (1 + (ligne.TVA?.taux_tva ?? 20) / 100)
          ).toFixed(2) + " €"
        }))
      );
    } catch (error: any) {
      const status = error.message.includes("invalide") ? 400 : 500;
      res.status(status).json({ message: error.message ?? "Erreur serveur" });
    }
  }
);

// Lecture : total panier client
ligneCommandeRouter.get(
  "/client/:id_client/total",
  monMiddlewareBearer,
  async (req, res) => {
    try {
      const id = parseId(req.params.id_client, "id_client");

      const lignes = await prisma.ligneCommande.findMany({
        where: { id_client: id, id_commande: null },
        include: {
          TVA: true,
          Personnalisation: true, 
        },
      });

      const total = lignes.reduce((sum, l) => {
        const tvaRate = (l.TVA?.taux_tva ?? 20) / 100;
        const baseHt = Number(l.prix_ht);
        const persoHt = l.Personnalisation
          ? Number(l.Personnalisation.prix_ht)
          : 0;

        const unitTtc = (baseHt + persoHt) * (1 + tvaRate);
        return sum + l.quantite * unitTtc;
      }, 0);

      res.json({ total: total.toFixed(2) + " €" });
    } catch (error: any) {
      const status = error.message.includes("invalide") ? 400 : 500;
      res.status(status).json({ message: error.message ?? "Erreur serveur" });
    }
  }
);

ligneCommandeRouter.get(
  "/client/:id_client/panier",
  monMiddlewareBearer,
  async (req, res) => {
    try {
      const id = parseId(req.params.id_client, "id_client");

      const panier = await prisma.ligneCommande.findMany({
        where: { id_client: id, id_commande: null },
        include: {
          Maillot: true,
          TVA: true,
          Personnalisation: true, 
        },
        orderBy: { date_creation: "asc" },
      });

      const panierAvecPrix = panier.map(ligne => {
        const tvaRate = (ligne.TVA?.taux_tva ?? 20) / 100;
        const baseHt = Number(ligne.prix_ht);

        const persoHt = ligne.Personnalisation
          ? Number(ligne.Personnalisation.prix_ht)
          : 0;

        const unitTtc = (baseHt + persoHt) * (1 + tvaRate);

        return {
          ...ligne,
          unitTtc: unitTtc.toFixed(2) + " €",
          totalTtc: (unitTtc * ligne.quantite).toFixed(2) + " €"
        };
      });
      res.json(panierAvecPrix);
    } catch (error: any) {
      const status = error.message.includes("invalide") ? 400 : 500;
      res.status(status).json({ message: error.message ?? "Erreur serveur" });
    }
  }
);


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



/*** Nettoyage des paniers invités  ***********************************/

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
  "/:id_ligne/client",
  authOptional,
  async (req: any, res: Response) => {
    try {
      const id = parseId(req.params.id_ligne, "id_lignecommande");
      const payload = req.decoded as any;
      const idClientToken = payload?.id_client ?? payload?.idf_client ?? null;

      const ligne = await prisma.ligneCommande.findUnique({ where: { id_lignecommande: id } });
      if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
      if (ligne.id_client !== null && ligne.id_client !== idClientToken) {
        return res.status(403).json({ message: "Accès interdit" });
      }
      if (ligne.id_commande !== null) {
        return res.status(400).json({ message: "Commande déjà validée" });
      }

      await prisma.ligneCommande.delete({ where: { id_lignecommande: id } });
      res.sendStatus(204);
    } catch (err: any) {
      console.error("💥 Erreur DELETE:", err);
      const status = err.message.includes("invalide") ? 400 : 500;
      res.status(status).json({ message: err.message ?? "Erreur serveur" });
    }
  }
);


