// src/index.ts
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { PrismaClient } from '@prisma/client';

import {
  authRouter,        maillotRouter,     artisteRouter,
  associationRouter, avisRouter,        ligneCommandeRouter,
  commandeRouter,    reductionRouter,   tvaRouter,
  roleRouter,        personnalisationRouter,
  livraisonRouter,   livreurRouter,     lieuLivraisonRouter,
  methodeLivraisonRouter, stockRouter,  stockmaillotRouter,
  factureRouter,     retourRouter,      avoirRouter,
  clientRouter,      stripeRouter,      stripeWebhookRouter
} from './router';           // <-- regroupe tes exports si tu veux

import { monMiddlewareBearer } from './middleware/checkToken';
import { isAdmin }            from './middleware/isAdmin';

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
  'http://localhost:4200',
  'https://urban-heritage-project.vercel.app',
  /\.vercel\.app$/                 // previews Vercel
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                 // same-site / Postman
    const ok = ALLOWED_ORIGINS.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin);
    return ok ? cb(null, true) : cb(new Error('Origin non autorisé'));
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

/*───────────────────────────────
  Déclaration des routes
────────────────────────────────*/
api.use('/auth',            authRouter);
api.use('/client',          clientRouter);
api.use('/maillot',         maillotRouter);
api.use('/artiste',         artisteRouter);
api.use('/association',     associationRouter);
api.use('/avis',            avisRouter);
api.use('/lignecommande',   ligneCommandeRouter);
api.use('/commande',        monMiddlewareBearer, commandeRouter);
api.use('/reduction',       reductionRouter);
api.use('/tva',             tvaRouter);
api.use('/role',            monMiddlewareBearer, isAdmin, roleRouter);
api.use('/personnalisation',personnalisationRouter);
api.use('/livraison',       monMiddlewareBearer, livraisonRouter);
api.use('/livreur',         livreurRouter);
api.use('/lieu-livraison',  lieuLivraisonRouter);
api.use('/methode-livraison', methodeLivraisonRouter);
api.use('/stock',           stockRouter);
api.use('/stockmaillot',    stockmaillotRouter);
api.use('/facture',         factureRouter);
api.use('/retour',          retourRouter);
api.use('/avoir',           monMiddlewareBearer, isAdmin, avoirRouter);
api.use('/stripe',          stripeRouter);
