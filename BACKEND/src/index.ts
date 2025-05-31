// src/index.ts

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "@prisma/client";

import { authRouter } from "./router/auth";
import { maillotRouter } from "./router/maillots";
import { artisteRouter } from "./router/artistes";
import { associationRouter } from "./router/associations";
import { avisRouter } from "./router/avis";
import { ligneCommandeRouter } from "./router/lignecommandes";
import { commandeRouter } from "./router/commandes";
import { reductionRouter } from "./router/reductions";
import { tvaRouter } from "./router/tva";
import { roleRouter } from "./router/roles";
import { personnalisationRouter } from "./router/personnalisations";
import { livraisonRouter } from "./router/livraisons";
import { livreurRouter } from "./router/livreurs";
import { lieuLivraisonRouter } from "./router/lieuLivraisons";
import { methodeLivraisonRouter } from "./router/methodeLivraisons";
import { stockRouter } from "./router/stocks";
import { stockmaillotRouter } from "./router/stockMaillots";
import { factureRouter } from "./router/factures";
import { retourRouter } from "./router/retours";
import { avoirRouter } from "./router/avoirs";
import { clientRouter } from "./router/clients";
import { stripeRouter } from "./router/stripe";
import { stripeWebhookRouter } from "./router/stripeWebhook";

import { monMiddlewareBearer } from "./middleware/checkToken";
import { isAdmin } from "./middleware/isAdmin";

/*───────────────────────────────
  Chargement de la bonne config
────────────────────────────────*/
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
});

/*───────────────────────────────
  Instances
────────────────────────────────*/
export const prisma = new PrismaClient();
export const app     = express();

/*───────────────────────────────
  CORS
────────────────────────────────*/
const ALLOWED_ORIGINS = [
  /^http:\/\/localhost(?::\d+)?$/,           // localhost 3000, 4200, etc.
  /^https:\/\/urban-heritage-project\.vercel\.app$/,
  /\.vercel\.app$/                   // previews Vercel
];

app.use(cors({
  origin: (origin, cb) => {
    console.log('CORS Origin reçu →', origin);   // ← garde ce log

    if (!origin) return cb(null, true);          // Postman / même domaine

    const ok = ALLOWED_ORIGINS.some(p =>
      p instanceof RegExp ? p.test(origin) : p === origin
    );
    return ok ? cb(null, true)
              : cb(new Error('Origin non autorisé : ' + origin));
  },
  credentials: true,
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,X-Requested-With,ngsw-bypass'
}));

// autoriser les pré-vols CORS universellement
app.options('*', cors());

/*───────────────────────────────
  Stripe : raw body
────────────────────────────────*/
app.use('/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookRouter
);

/*───────────────────────────────
  Parse JSON
────────────────────────────────*/
app.use(express.json({ limit: '1mb' }));   // 100 kB défaut → 1 MB

/*───────────────────────────────
  Trace rudimentaire
────────────────────────────────*/
app.use((req, _res, next) => {
  console.log('[TRACE]', req.method, req.originalUrl);
  next();
});

/*───────────────────────────────
  Routeur principal
────────────────────────────────*/
const api = express.Router();
app.use('/api', api);


// Déclaration des routes
api.use("/auth", authRouter);
api.use("/client", clientRouter);
api.use("/maillot", maillotRouter);
api.use("/artiste", artisteRouter);
api.use("/association", associationRouter);
api.use("/avis", avisRouter);
api.use("/lignecommande", ligneCommandeRouter);
api.use("/commande", monMiddlewareBearer, commandeRouter);
api.use("/reduction", reductionRouter);
api.use("/tva", tvaRouter);
api.use("/role", monMiddlewareBearer, isAdmin, roleRouter);
api.use("/personnalisation", personnalisationRouter);
api.use("/livraison", monMiddlewareBearer, livraisonRouter);
api.use("/livreur", livreurRouter);
api.use("/lieu-livraison", lieuLivraisonRouter);
api.use("/methode-livraison", methodeLivraisonRouter);
api.use("/stock", stockRouter);
api.use("/stockmaillot", stockmaillotRouter);
api.use("/facture", factureRouter);
api.use("/retour", retourRouter);
api.use("/avoir", monMiddlewareBearer, isAdmin, avoirRouter);
api.use("/stripe", stripeRouter);
