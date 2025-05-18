import { Router } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });

dotenv.config();
export const stripeRouter = Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

/*** Paiement ***************************************************************/

stripeRouter.post(
  "/create-checkout-session/:id_commande",
  monMiddlewareBearer,
  async (req: any, res) => {
    const id_commande = parseInt(req.params.id_commande, 10);
    const id_client = req.decoded.id_client;

    if (Number.isNaN(id_commande)) {
      return res.status(400).json({ message: "ID de commande invalide" });
    }

    try {
      /* --------- 1. Charger la commande complète --------- */
      const commande = await prisma.commande.findUnique({
        where: { id_commande },
        include: {
          LigneCommande: {
            include: {
              Maillot: true,
              Personnalisation: true, // ← nouvelle relation
            },
          },
          Livraison: {
            include: { MethodeLivraison: true, LieuLivraison: true },
          },
        },
      });

      if (!commande)
        return res.status(404).json({ message: "Commande introuvable" });

      if (commande.id_client !== id_client)
        return res.status(403).json({ message: "Accès interdit" });

      /* --------- 2. Construire les line_items --------- */
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let montant_total_ttc = 0;

      for (const ligne of commande.LigneCommande) {
        /* -- Prix maillot -- */
        const prixMaillotHt = Number(ligne.Maillot.prix_ht_maillot);
        const totalMaillot = prixMaillotHt * ligne.quantite;
        montant_total_ttc += totalMaillot;

        line_items.push({
          price_data: {
            currency: "eur",
            product_data: {
              name: `Maillot ${ligne.Maillot.nom_maillot} - Taille ${ligne.taille_maillot}`,
            },
            unit_amount: Math.round(prixMaillotHt * 100),
          },
          quantity: ligne.quantite,
        });

        /* -- Personnalisation éventuelle -- */
        if (ligne.ligne_commande_personnalisee && ligne.Personnalisation) {
          const prixPersoHt = Number(ligne.Personnalisation.prix_ht);
          montant_total_ttc += prixPersoHt;

          line_items.push({
            price_data: {
              currency: "eur",
              product_data: {
                name: `+ Personnalisation ${ligne.Personnalisation.type_personnalisation}`,
              },
              unit_amount: Math.round(prixPersoHt * 100),
            },
            quantity: 1,
          });
        }
      }

      /* -- Frais de livraison -- */
      const livraison = commande.Livraison[0];
      if (livraison) {
        const prixLivraison =
          (livraison.MethodeLivraison?.prix_methode || 0) +
          (livraison.LieuLivraison?.prix_lieu || 0);
        montant_total_ttc += prixLivraison;

        line_items.push({
          price_data: {
            currency: "eur",
            product_data: { name: "Livraison" },
            unit_amount: Math.round(prixLivraison * 100),
          },
          quantity: 1,
        });
      }

      /* --------- 3. Mettre à jour le montant dans la commande --------- */
      await prisma.commande.update({
        where: { id_commande },
        data: { montant_total_ttc },
      });

      /* --------- 4. Créer la session Stripe --------- */
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        success_url: process.env.SUCCESS_URL || "https://example.com/success",
        cancel_url: process.env.CANCEL_URL || "https://example.com/cancel",
        metadata: { id_commande: id_commande.toString() },
      });

      res.status(200).json({ url: session.url });
    } catch (err: any) {
      console.error("Erreur Stripe Checkout :", err);
      res
        .status(500)
        .json({ message: "Erreur création session Stripe", erreur: err.message });
    }
  }
);