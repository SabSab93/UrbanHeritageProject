
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "@prisma/client";

import { authRouter } from "./router/auth";
import { maillotRouter } from "./router/maillots";
import { artisteRouter } from "./router/artistes";
import { associationRouter } from "./router/associations";
import { monMiddlewareBearer } from "./middleware/checkToken";
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
import { stripeRouter } from "./router/stripe";
import { factureRouter } from "./router/factures";
import { retourRouter } from "./router/retours";
import { isAdmin } from "./middleware/isAdmin";
import { avoirRouter } from "./router/avoirs";
import { clientRouter } from "./router/clients";

dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? '.env.prod'
    : '.env.dev'
});

export const prisma = new PrismaClient();


export const app = express();

app.use(cors({
  origin: (incomingOrigin, callback) => {
    if (!incomingOrigin) {
      return callback(null, true);
    }
    let hostname: string;
    try {
      hostname = new URL(incomingOrigin).hostname;
    } catch {
      return callback(new Error("Origin invalide"), false);
    }

    // 1) toujours autoriser en local (dev)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return callback(null, true);
    }

    // 2) autoriser Vercel
    if (hostname.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    // 3) sinon, refuser
    return callback(null, false);
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With","ngsw-bypass"],
  credentials: true,
  optionsSuccessStatus: 204
}));


app.options("*", cors());
app.use(express.json());

const apiRouter = express.Router();
app.use("/api", apiRouter);

// Montage des sous‐routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/client", clientRouter);
apiRouter.use("/maillot", maillotRouter);
apiRouter.use("/artiste", artisteRouter);
apiRouter.use("/association", associationRouter);
apiRouter.use("/avis", avisRouter);
apiRouter.use("/lignecommande", ligneCommandeRouter);
apiRouter.use("/commande", monMiddlewareBearer, commandeRouter);
apiRouter.use("/reduction", reductionRouter);
apiRouter.use("/tva", tvaRouter);
apiRouter.use("/role", monMiddlewareBearer, isAdmin, roleRouter);
apiRouter.use("/personnalisation", personnalisationRouter);
apiRouter.use("/livraison", monMiddlewareBearer, livraisonRouter);
apiRouter.use("/livreur", livreurRouter);
apiRouter.use("/lieu-livraison", lieuLivraisonRouter);
apiRouter.use("/methode-livraison", methodeLivraisonRouter);
apiRouter.use("/stock", stockRouter);
apiRouter.use("/stockmaillot", stockmaillotRouter);
apiRouter.use("/stripe", stripeRouter);
apiRouter.use("/facture", factureRouter);
apiRouter.use("/retour", retourRouter);
apiRouter.use("/avoir", monMiddlewareBearer, isAdmin, avoirRouter);
