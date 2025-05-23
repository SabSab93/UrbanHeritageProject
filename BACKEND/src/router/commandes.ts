import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";
import { validerPaiementTransaction } from "../utils/ValiderPaiementTransaction";
import { checkCommandeTransaction } from "../utils/CheckCommandeTransaction";
import { sendMail } from "../utils/mailService";
import { templateExpeditionCommande }   from "../templateMails/commande/commandeExpedition";
import { templateCommandeRetour }       from "../templateMails/commande/commandeRetour";
import { templateDemandeAvis }          from "../templateMails/commande/commandeDemandeAvis";
import { templateLivraisonConfirmee }   from "../templateMails/commande/commandeLivree";
import { templateCommandeRetard }       from "../templateMails/commande/commandeRetard";
import { templatePreparationCommande } from "../templateMails/commande/CommandePreparation";


export const commandeRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
/** Convertit un paramètre d’URL en entier positif. */
const parseId = (raw: any, label = "ID") => {
  const parsed = parseInt(raw as string, 10);
  if (Number.isNaN(parsed) || parsed <= 0) throw new Error(`${label} invalide`);
  return parsed;
};

/*** 1. Création d’une commande **********************************************/
commandeRouter.post("/create", async (req: any, res) => {
  try {
    const idClient = req.decoded.id_client;

    const pendingLines = await prisma.ligneCommande.findMany({
      where: { id_client: idClient, id_commande: null },
    });
    if (pendingLines.length === 0)
      return res.status(400).json({ message: "Panier vide." });

    const newOrder = await prisma.commande.create({
      data: {
        id_client: idClient,
        date_commande: new Date(),
        statut_commande: "en_cours",
      },
    });

    await Promise.all(
      pendingLines.map((l) =>
        prisma.ligneCommande.update({
          where: { id_lignecommande: l.id_lignecommande },
          data: { id_commande: newOrder.id_commande },
        })
      )
    );

    res.status(201).json({ message: "Commande créée", commande: newOrder });
  } catch (error) {
    console.error("POST /commande/create", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** 2. Lecture : liste & détail *********************************************/
// Toutes les commandes du client
commandeRouter.get("/", async (req: any, res) => {
  try {
    const orders = await prisma.commande.findMany({
      where: { id_client: req.decoded.id_client },
      include: { LigneCommande: true },
    });
    res.json(orders);
  } catch (error) {
    console.error("GET /commande", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Détail d’une commande
commandeRouter.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const order = await prisma.commande.findUnique({
      where: { id_commande: id },
      include: {
        Client: true,
        LigneCommande: {
          include: {
            Maillot: true,
            TVA: true,
            Personnalisation: true,
          },
        },
        CommandeReduction: { include: { Reduction: true } },
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison: true,
            Livreur: true,
          },
        },
      },
    });
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });
        const lignes = order.LigneCommande.map((l) => {
      const tva = l.TVA?.taux_tva ?? 20;
      const prixBaseHt = Number(l.prix_ht);
      const prixPersoHt = l.Personnalisation ? Number(l.Personnalisation.prix_ht) : 0;
      const unitTtc = (prixBaseHt + prixPersoHt) * (1 + tva / 100);
      const totalLigneTtc = unitTtc * l.quantite;

      return {
        ...l,
        unitTtc: unitTtc.toFixed(2),
        totalLigneTtc: totalLigneTtc.toFixed(2),
      };
    });
    res.json(order);
  } catch (error: any) {
    const status = error.message.includes("ID") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** 3. Mise à jour du statut (Admin) ****************************************/
commandeRouter.put("/:id", isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const { statut_commande } = req.body.data;
    if (!statut_commande)
      return res.status(400).json({ message: "statut_commande manquant" });

    const order = await prisma.commande.findUnique({
      where: { id_commande: id },
      include: { Client: true, LigneCommande: { include: { Maillot: true } } },
    });
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });

    const updated = await prisma.commande.update({
      where: { id_commande: id },
      data: { statut_commande },
    });

    const client = order.Client;
    if (client) {
      switch (statut_commande) {
        case "en_cours_de_preparation":   // 🆕
          await sendMail({
            to: client.adresse_mail_client,
            subject: "🧵 Votre commande est en cours de préparation",
            html: templatePreparationCommande(
              client.prenom_client || client.nom_client,
              `${id}`
            ),
          });
          break;
        case "livraison":
          await sendMail({
            to: client.adresse_mail_client,
            subject: "📦 Votre commande est expédiée !",
            html: templateExpeditionCommande(client.prenom_client || client.nom_client, `${id}`),
          });
          break;
        case "livre":
          await sendMail({
            to: client.adresse_mail_client,
            subject: "✅ Votre commande a été livrée !",
            html: templateLivraisonConfirmee(client.prenom_client || client.nom_client, `${id}`),
          });
          await Promise.all(
            order.LigneCommande.map((l) =>
              sendMail({
                to: client.adresse_mail_client,
                subject: "⭐ Donnez votre avis sur votre maillot UrbanHeritage",
                html: templateDemandeAvis(client.prenom_client || client.nom_client, l.id_maillot, l.Maillot?.nom_maillot || "votre maillot"),
              })
            )
          );
          break;
        case "retard":
          await sendMail({
            to: client.adresse_mail_client,
            subject: "⏳ Votre commande rencontre un retard",
            html: templateCommandeRetard(client.prenom_client || client.nom_client, `${id}`),
          });
          break;
        case "retour":
          await sendMail({
            to: client.adresse_mail_client,
            subject: "↩️ Retour de votre commande UrbanHeritage",
            html: templateCommandeRetour(client.prenom_client || client.nom_client, `${id}`),
          });
          break;
      }
    }

    res.json({ message: `Statut mis à jour → ${statut_commande}`, commande: updated });
  } catch (error: any) {
    const status = error.message.includes("ID") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** 4. Suppression d’une commande (Admin) ***********************************/
commandeRouter.delete("/:id", isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    await prisma.commande.delete({ where: { id_commande: id } });
    res.json({ message: "Commande supprimée" });
  } catch (error: any) {
    const status = error.message.includes("ID") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** 5. Finaliser une commande (client) **************************************/
/********************************************************************************
 * 5. Finaliser une commande (client) – crée la commande + livraison + retourne
 *    l’objet `commande` pour que le front obtienne `id_commande`.
 *******************************************************************************/
commandeRouter.post(
  '/finaliser',
  monMiddlewareBearer,
  async (req: any, res: Response) => {
    try {
      const idClient = req.decoded.id_client;

      const {
        useClientAddress,
        adresse_livraison,
        code_postal_livraison,
        ville_livraison,
        pays_livraison,
        id_methode_livraison,
        id_lieu_livraison,
        id_livreur
      } = req.body.livraison;

      /* 1️⃣  vérifs basiques */
      if (
        useClientAddress == null ||
        id_methode_livraison == null ||
        id_lieu_livraison == null ||
        id_livreur == null
      ) {
        return res.status(400).json({ message: 'Données de livraison incomplètes' });
      }

      /* 2️⃣  crée la commande + rattache les lignes 📦 */
      const livraisonPayload = {
        id_methode_livraison,
        id_lieu_livraison,
        id_livreur,
        ...(useClientAddress === false && {
          adresse_livraison,
          code_postal_livraison,
          ville_livraison,
          pays_livraison
        })
      };

      /* 👉 checkCommandeTransaction crée la commande, règle le stock, etc. */
      const commande = await checkCommandeTransaction(idClient, livraisonPayload);

      /* 3️⃣  enregistre la livraison réelle (adresse client ou manuelle) */
      const client = await prisma.client.findUnique({ where: { id_client: idClient } });

      await prisma.livraison.create({
        data: {
          id_commande:        commande.id_commande,
          id_methode_livraison,
          id_lieu_livraison,
          id_livreur,
          date_livraison:     null,
          adresse_livraison:  useClientAddress ? client!.adresse_client        : adresse_livraison,
          code_postal_livraison: useClientAddress ? client!.code_postal_client : code_postal_livraison,
          ville_livraison:    useClientAddress ? client!.ville_client          : ville_livraison,
          pays_livraison:     useClientAddress ? client!.pays_client           : pays_livraison
        }
      });

      /* 4️⃣  réponse => le front récupère id_commande */
      return res.status(201).json({
        message: 'Commande finalisée 🚀',
        commande,               // contient id_commande
      });

    } catch (err: any) {
      console.error('POST /commande/finaliser', err);
      return res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
  }
);


/*** 6. Ajouter une réduction à une commande *********************************/
commandeRouter.post(
  "/:id_commande/reduction",
  async (req, res) => {
    try {
      const idCommande = parseId(req.params.id_commande, "id_commande");
      const { id_reduction } = req.body.data;
      const idReduction = parseId(id_reduction, "id_reduction");

      const order = await prisma.commande.findUnique({ where: { id_commande: idCommande } });
      if (!order) return res.status(404).json({ message: "Commande introuvable" });

      const reduction = await prisma.reduction.findUnique({ where: { id_reduction: idReduction } });
      if (!reduction) return res.status(404).json({ message: "Réduction introuvable" });

      const existingLink = await prisma.commandeReduction.findUnique({ where: { id_commande: idCommande } });
      if (existingLink)
        return res.status(400).json({ message: "Réduction déjà appliquée" });

      const link = await prisma.commandeReduction.create({ data: { id_commande: idCommande, id_reduction: idReduction } });
      res.status(201).json({ message: "Réduction ajoutée 🎯", link });
    } catch (error: any) {
      const status = error.message.includes("ID") ? 400 : 500;
      res.status(status).json({ message: error.message ?? "Erreur serveur" });
    }
  }
);

/*** 7. Valider paiement ******************************************************/
commandeRouter.post(
  '/valider-paiement/:id',
  async (req: any, res: Response) => {
    try {
      const idCommande = parseId(req.params.id, 'id_commande');
      const result = await validerPaiementTransaction(idCommande);
      res.json({ message: 'Paiement validé 🎉', details: result });
    } catch (error: any) {
      const status = error.message.includes('ID') ? 400 : 500;
      res.status(status).json({ message: error.message ?? 'Erreur serveur' });
    }
  }
);
