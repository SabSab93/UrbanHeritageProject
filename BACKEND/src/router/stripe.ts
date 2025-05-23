// src/router/stripe.ts
import { Router } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../middleware/checkToken";
import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

export const stripeRouter = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

/**
 * Construit la liste des `line_items` Stripe à partir du panier d'un client.
 */
async function buildLineItemsForOrder(
  id_commande: number
): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
  const cmd = await prisma.commande.findUnique({
    where: { id_commande },
    include: {
      LigneCommande: {
        include: { Maillot: true, TVA: true, Personnalisation: true }
      },
      Livraison: {
        include: { MethodeLivraison: true, LieuLivraison: true }
      }
    }
  });
  if (!cmd) throw new Error("Commande introuvable");

  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // articles
  for (const l of cmd.LigneCommande) {
    const prixHt    = l.prix_ht.toNumber();
    const tauxTva   = l.TVA?.taux_tva ?? 20;
    const centimes  = Math.round(prixHt * (1 + tauxTva / 100) * 100);

    items.push({
      price_data: {
        currency: "eur",
        product_data: { name: `${l.Maillot.nom_maillot} – Taille ${l.taille_maillot}` },
        unit_amount: centimes
      },
      quantity: l.quantite
    });

    if (l.Personnalisation) {
      const p = Math.round(l.Personnalisation.prix_ht.toNumber() * 100);
      items.push({
        price_data: {
          currency: "eur",
          product_data: { name: `+ Perso: ${l.Personnalisation.type_personnalisation}` },
          unit_amount: p
        },
        quantity: 1
      });
    }
  }

  // frais de livraison
  const liv = cmd.Livraison[0]!;
  const fraisCentimes = Math.round(((liv.MethodeLivraison.prix_methode||0) + (liv.LieuLivraison.prix_lieu||0)) * 100);
  items.push({
    price_data: {
      currency: "eur",
      product_data: { name: "Frais de livraison" },
      unit_amount: fraisCentimes
    },
    quantity: 1
  });

  return items;
}

stripeRouter.post(
  "/create-checkout-session/:id_commande",
  monMiddlewareBearer,
  async (req: any, res) => {
    try {
      const id_commande = parseInt(req.params.id_commande, 10);
      if (isNaN(id_commande)) {
        return res.status(400).json({ message: "id_commande invalide" });
      }

      // build line_items
      const line_items = await buildLineItemsForOrder(id_commande);

      // create Stripe session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        success_url: `${process.env.FRONTEND_URL}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/paiement/cancel?reason=user_cancel`,
        metadata: { id_commande: id_commande.toString() }
      });

      return res.json({ url: session.url });
    } catch (err: any) {
      console.error("❌ Erreur création session Stripe :", err);
      return res.status(500).json({ message: err.message });
    }
  }
);

stripeRouter.get(
  "/session/:session_id",
  monMiddlewareBearer,
  async (req: any, res) => {
    try {
      const sess = await stripe.checkout.sessions.retrieve(req.params.session_id);
      return res.json(sess);
    } catch (err: any) {
      console.error("❌ Erreur récupération session Stripe :", err);
      return res.status(500).json({ message: err.message });
    }
  }
);

