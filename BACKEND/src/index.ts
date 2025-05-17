
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

dotenv.config();

export const prisma = new PrismaClient();


export const app = express();

app.use(cors({
  origin: (incomingOrigin, callback) => {
    console.log("CORS Origin reçu →", incomingOrigin);

    // 1) Pas d’origin => autorisé (Postman, CURL…)
    if (!incomingOrigin) {
      return callback(null, true);
    }

    // 2) Match par hostname *.vercel.app
    let hostname: string;
    try {
      hostname = new URL(incomingOrigin).hostname;
    } catch {
      // Si ce n’est pas une URL valide, on refuse
      return callback(null, false);
    }
    if (hostname.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    // 3) Sinon on refuse proprement
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','ngsw-bypass'],
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
