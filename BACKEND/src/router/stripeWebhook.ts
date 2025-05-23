// src/router/stripeWebhook.ts

import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { validerPaiementTransaction } from "../utils/ValiderPaiementTransaction";

// 📌 Charge les variables d'environnement
dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev" });

export const stripeWebhookRouter = express.Router();

// ⚙️ Initialisation Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

// Clé secrète du webhook (disponible dans le dashboard Stripe)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Réception des évènements Stripe
 * Nous n'avons besoin ici que de `checkout.session.completed` :
 * – la commande existe déjà
 * – on se contente de la passer en "payée" et de déclencher la suite (stock, mails, facture…)
 */
stripeWebhookRouter.post('/', async (req, res) => {
    let event: Stripe.Event;

    // 1️⃣ Vérification de signature
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"] as string,
        webhookSecret,
      );
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2️⃣ Traitement des évènements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const id_commande = Number(session.metadata?.id_commande);

        if (!id_commande) {
          console.error("🚨 Metadata `id_commande` manquante dans la session Stripe");
          break;
        }

        try {
          // Validation du paiement : débite le stock, met à jour la commande, génère la facture, envoie les mails…
          await validerPaiementTransaction(id_commande);
          console.log(`✅ Commande ${id_commande} finalisée et payée.`);
        } catch (e) {
          console.error("🚨 Erreur lors de la validation du paiement :", e);
        }
        break;
      }

      // Les autres évènements ne sont pas utiles pour l’instant
      default:
        console.log(`ℹ️ Webhook Stripe ignoré : ${event.type}`);
    }

    // 3️⃣ Réponse à Stripe (obligatoire pour accuser réception)
    res.json({ received: true });
  },
);
