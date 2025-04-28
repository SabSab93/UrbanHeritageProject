import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { isAdmin } from "../../middleware/isAdmin";
import { validerPaiementTransaction } from "../utils/ValiderPaiementTransaction";
import { checkCommandeTransaction } from "../utils/CheckCommandeTransaction";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { sendMail } from "../utils/mailService";
import { templateExpeditionCommande } from "../templateMails/commande/commandeExpedition";
import { templateCommandeRetour } from "../templateMails/commande/commandeRetour";
import { templateDemandeAvis } from "../templateMails/commande/commandeDemandeAvis";
import { templateLivraisonConfirmee } from "../templateMails/commande/commandeLivree";
import { templateCommandeRetard } from "../templateMails/commande/commandeRetard";

export const commandeRouter = Router();
const prisma = new PrismaClient();

// ✅ POST - Créer une commande
commandeRouter.post("/create", monMiddlewareBearer, async (req: any, res) => {
  try {
    const idClient = req.decoded.id_client;

    const lignes = await prisma.ligneCommande.findMany({
      where: {
        id_client: idClient,
        id_commande: null,
      },
    });

    if (lignes.length === 0) {
      return res.status(400).json({ message: "Panier vide. Aucune ligne à commander." });
    }

    const nouvelleCommande = await prisma.commande.create({
      data: {
        id_client: idClient,
        date_commande: new Date(),
        statut_commande: "en_cours",
      },
    });

    await Promise.all(lignes.map(ligne => 
      prisma.ligneCommande.update({
        where: { id_lignecommande: ligne.id_lignecommande },
        data: { id_commande: nouvelleCommande.id_commande },
      })
    ));

    res.status(201).json({ message: "Commande créée", commande: nouvelleCommande });
  } catch (error) {
    console.error("Erreur création commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - Toutes les commandes du client
commandeRouter.get("/", monMiddlewareBearer, async (req: any, res) => {
  try {
    const idClient = req.decoded.id_client;

    const commandes = await prisma.commande.findMany({
      where: { id_client: idClient },
      include: { LigneCommande: true },
    });

    res.json(commandes);
  } catch (error) {
    console.error("Erreur récupération commandes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - Détails d'une commande
commandeRouter.get("/:id", monMiddlewareBearer, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const commande = await prisma.commande.findUnique({
      where: { id_commande: id },
      include: {
        Client: true,
        LigneCommande: {
          include: {
            Maillot: true,
            LigneCommandePersonnalisation: { include: { Personnalisation: true } },

          },
        },
        CommandeReduction: {
          include: {
            Reduction: true,
          },
        },
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison: true,
            Livreur: true,
          },
        },
      },
    });

    if (!commande) return res.status(404).json({ message: "Commande non trouvée" });

    res.json(commande);
  } catch (error) {
    console.error("Erreur récupération commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT - Modifier statut commande (admin)
commandeRouter.put("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { statut_commande } = req.body.data;

  if (isNaN(id) || !statut_commande) {
    return res.status(400).json({ message: "ID ou statut manquant." });
  }

  try {
    const commande = await prisma.commande.findUnique({
      where: { id_commande: id },
      include: {
        Client: true,
        LigneCommande: { include: { Maillot: true } },
      },
    });

    if (!commande) return res.status(404).json({ message: "Commande non trouvée." });

    const updatedCommande = await prisma.commande.update({
      where: { id_commande: id },
      data: { statut_commande },
    });

    const client = commande.Client;

    if (client) {
      switch (statut_commande) {
        case "livraison":
          await sendMail({
            to: client.adresse_mail_client,
            subject: "📦 Votre commande est expédiée !",
            html: templateExpeditionCommande(client.prenom_client || client.nom_client, commande.id_commande.toString()),
          });
          break;
        case "livre":
          await sendMail({
            to: client.adresse_mail_client,
            subject: "✅ Votre commande a été livrée !",
            html: templateLivraisonConfirmee(client.prenom_client || client.nom_client, commande.id_commande.toString()),
          });

          await Promise.all(commande.LigneCommande.map(ligne =>
            sendMail({
              to: client.adresse_mail_client,
              subject: "⭐ Donnez votre avis sur votre maillot UrbanHeritage",
              html: templateDemandeAvis(client.prenom_client || client.nom_client, ligne.id_maillot, ligne.Maillot?.nom_maillot || "votre maillot"),
            })
          ));
          break;
        case "retard":
          await sendMail({
            to: client.adresse_mail_client,
            subject: "⏳ Votre commande rencontre un retard",
            html: templateCommandeRetard(client.prenom_client || client.nom_client, commande.id_commande.toString()),
          });
          break;
        case "retour":
          await sendMail({
            to: client.adresse_mail_client,
            subject: "↩️ Retour de votre commande UrbanHeritage",
            html: templateCommandeRetour(client.prenom_client || client.nom_client, commande.id_commande.toString()),
          });
          break;
      }
    }

    res.status(200).json({
      message: `Statut de la commande mis à jour en "${statut_commande}" avec succès 🚚`,
      commande: updatedCommande,
    });
  } catch (error: any) {
    console.error("Erreur update statut commande :", error.message || error);
    res.status(500).json({ message: "Erreur serveur", details: error.message || error });
  }
});

// ✅ DELETE - Supprimer une commande (admin)
commandeRouter.delete("/:id", monMiddlewareBearer, isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.commande.delete({ where: { id_commande: id } });
    res.json({ message: "Commande supprimée" });
  } catch (error) {
    console.error("Erreur suppression commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ POST - Finaliser une commande
commandeRouter.post(
  "/finaliser",
  monMiddlewareBearer,
  async (req: any, res) => {
    try {
      const id_client  = req.decoded.id_client;
      const livraison  = req.body.livraison;            // 👈 plus de "lignes" !

      if (!livraison) {
        return res.status(400).json({ message: "Livraison manquante." });
      }

      const commande = await checkCommandeTransaction(id_client, livraison);

      res.status(201).json({ message: "Commande finalisée 🚀", commande });
    } catch (e: any) {
      console.error("Erreur finalisation commande :", e);
      res.status(500).json({ message: "Erreur serveur", details: e.message });
    }
  }
);

// ✅ POST - Ajouter une réduction à une commande
commandeRouter.post("/:id_commande/reduction", monMiddlewareBearer, async (req, res) => {
  const id_commande = parseInt(req.params.id_commande);
  const { id_reduction } = req.body.data;

  if (isNaN(id_commande) || isNaN(id_reduction)) {
    return res.status(400).json({ message: "ID invalide." });
  }

  try {
    const commande = await prisma.commande.findUnique({ where: { id_commande } });
    if (!commande) return res.status(404).json({ message: "Commande introuvable." });

    const reduction = await prisma.reduction.findUnique({ where: { id_reduction } });
    if (!reduction) return res.status(404).json({ message: "Réduction introuvable." });

    const existingLink = await prisma.commandeReduction.findUnique({ where: { id_commande } });
    if (existingLink) {
      return res.status(400).json({ message: "Réduction déjà appliquée à cette commande." });
    }

    const link = await prisma.commandeReduction.create({
      data: { id_commande, id_reduction },
    });

    res.status(201).json({ message: "Réduction ajoutée 🎯", link });
  } catch (error: any) {
    console.error("Erreur ajout réduction :", error);
    res.status(500).json({ message: "Erreur serveur", erreur: error.message });
  }
});

// ✅ POST - Valider paiement
commandeRouter.post("/valider-paiement/:id", monMiddlewareBearer, async (req, res) => {
  const id_commande = parseInt(req.params.id);
  if (isNaN(id_commande)) return res.status(400).json({ message: "ID de commande invalide" });

  try {
    const result = await validerPaiementTransaction(id_commande);
    return res.status(200).json({ message: "Paiement validé 🎉", details: result });
  } catch (error: any) {
    console.error("Erreur validation paiement :", error);
    return res.status(500).json({ message: "Erreur lors de la validation du paiement.", erreur: error.message });
  }
});
