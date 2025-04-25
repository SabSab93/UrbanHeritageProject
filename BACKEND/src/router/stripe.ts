import { Router } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
export const stripeRouter = Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

stripeRouter.post("/create-checkout-session/:id_commande", async (req, res) => {
  const id_commande = parseInt(req.params.id_commande);
  if (isNaN(id_commande)) {
    return res.status(400).json({ message: "ID de commande invalide" });
  }

  try {
    const commande = await prisma.commande.findUnique({
      where: { id_commande },
      include: {
        LigneCommande: {
          include: {
            Maillot: true,
            LigneCommandePersonnalisation: {
              include: { Personnalisation: true },
            },
          },
        },
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison: true,
          },
        },
      },
    });

    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let montant_total_ttc = 0;

    for (const ligne of commande.LigneCommande) {
      const prix_ht_maillot = Number(ligne.prix_ht);
      const total_ligne = prix_ht_maillot * ligne.quantite;
      montant_total_ttc += total_ligne;

      // Article principal
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `Maillot ${ligne.Maillot.nom_maillot} - Taille ${ligne.taille_maillot}`,
          },
          unit_amount: prix_ht_maillot * 100,
        },
        quantity: ligne.quantite,
      });

      // Personnalisations
      for (const perso of ligne.LigneCommandePersonnalisation) {
        const prix_perso = Number(perso.prix_personnalisation_ht);
        montant_total_ttc += prix_perso;

        line_items.push({
          price_data: {
            currency: "eur",
            product_data: {
              name: `+ Personnalisation ${perso.Personnalisation.type_personnalisation}`,
            },
            unit_amount: prix_perso * 100,
          },
          quantity: 1,
        });
      }
    }

    // Livraison
    const livraison = commande.Livraison[0];
    if (livraison) {
      const prixLivraison =
        (livraison.MethodeLivraison?.prix_methode || 0) +
        (livraison.LieuLivraison?.prix_lieu || 0);
      montant_total_ttc += prixLivraison;

      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Livraison",
          },
          unit_amount: prixLivraison * 100,
        },
        quantity: 1,
      });
    }

    // Stockage du montant total TTC
    await prisma.commande.update({
      where: { id_commande },
      data: {
        montant_total_ttc,
      },
    });

    // Création session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.FRONTEND_URL}/paiement/success`,
      cancel_url: `${process.env.FRONTEND_URL}/paiement/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Erreur Stripe Checkout:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la session Stripe",
      erreur: error.message,
    });
  }
});
