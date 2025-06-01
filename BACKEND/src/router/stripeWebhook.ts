// src/router/stripeWebhook.ts

import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { validerPaiementTransaction } from "../utils/ValiderPaiementTransaction";
import { PrismaClient, statut_paiement_enum } from "@prisma/client";


dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev" });

export const stripeWebhookRouter = express.Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

stripeWebhookRouter.post('/', async (req, res) => {
  let event: Stripe.Event;


  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
      webhookSecret,
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  switch (event.type) {
    /* -------- SUCCÈS PAIEMENT (déjà présent) ---------------- */
    case 'checkout.session.completed': {
      const session     = event.data.object as Stripe.Checkout.Session;
      const id_commande = Number(session.metadata?.id_commande);
      if (!id_commande) {
        console.error('Metadata id_commande manquante');
        break;
      }
      try {
        await validerPaiementTransaction(id_commande);              
        console.log(`Commande ${id_commande} payée & validée`);
      } catch (e) {
        console.error('Erreur validation paiement :', e);
      }
      break;
    }

    /* -------- ABANDON ou EXPIRATION ------------------------- */
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const sess        = event.data.object as Stripe.Checkout.Session;
      const id_commande = Number(sess.metadata?.id_commande);
      if (!id_commande) break;

      try {
        await prisma.commande.update({
          where: { id_commande },
          data : { statut_paiement: statut_paiement_enum.echec },     
        });
        console.log(`Paiement échoué pour commande ${id_commande}`);
      } catch (e) {
        console.error('Impossible de passer la commande en "echoue" :', e);
      }
      break;
    }

    default:
      console.log(`Webhook ignoré : ${event.type}`);
  }

  res.json({ received: true });
});