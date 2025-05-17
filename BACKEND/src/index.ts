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

const app = express();
app.use(cors({
  origin: [
    "http://localhost:4200",                            
    "https://urban-heritage-project.vercel.app"       
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.options("*", cors());
app.use(express.json());

// Router principal
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

// Lecture du port et démarrage
const port = Number(process.env.PORT) || 1992;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Gestion du SIGTERM pour arrêt propre
process.once("SIGTERM", () => {
  server.close(() => {
    console.log("HTTP server closed");
  });
});
