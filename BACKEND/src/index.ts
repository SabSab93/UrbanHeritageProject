import cors from "cors";
import "dotenv/config";
import express from "express";


import { PrismaClient } from "@prisma/client";

import { clientRouter } from "./router/clients";
import { maillotRouter } from "./router/maillots";
import { artisteRouter } from "./router/artistes";
import { associationRouter } from "./router/associations";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { avisRouter } from "./router/avis";
import { ligneCommandeRouter } from "./router/lignecommandes";
import { commandeRouter } from "./router/commandes";
import { ligneCommandeReductionRouter } from "./router/lignecomandereduction";
import { reductionRouter } from "./router/reductions";
import { tvaRouter } from "./router/tva";
import { roleRouter } from "./router/roles";
import { personnalisationRouter } from "./router/personnalisations";
import { ligneCommandePersonnalisationRouter } from "./router/lignecommandepersonnalisation";
import { livraisonRouter } from "./router/livraisons";
import { livreurRouter } from "./router/livreurs";
import { lieuLivraisonRouter } from "./router/lieuLivraisons";
import { methodeLivraisonRouter } from "./router/methodeLivraisons";
import { stockRouter } from "./router/stocks";
import { stockmaillotRouter } from "./router/stockMaillots";
import { stripeRouter } from "./router/stripe";
import { factureRouter } from "./router/factures";
import { testMailRouter } from "./router/mails";
import { retourRouter } from "./router/retours";
import { isAdmin } from "../middleware/isAdmin";
import { avoirRouter } from "./router/avoirs";

testMailRouter

export const prisma = new PrismaClient();

const app = express();

app.use(cors()); 
app.use(express.json());



const apiRouter = express.Router();


app.use("/api", apiRouter); 


apiRouter.use("/auth", clientRouter)
apiRouter.use("/maillot", maillotRouter);
apiRouter.use("/artiste", artisteRouter);
apiRouter.use("/association", associationRouter);
apiRouter.use("/avis", avisRouter);
apiRouter.use("/lignecommande", ligneCommandeRouter);
apiRouter.use("/commande", monMiddlewareBearer, commandeRouter);
apiRouter.use("/lignecommande-reduction", ligneCommandeReductionRouter);
apiRouter.use("/reduction", reductionRouter);
apiRouter.use("/tva", tvaRouter);
apiRouter.use("/role", roleRouter);
apiRouter.use("/personnalisation", personnalisationRouter);
apiRouter.use("/lignecommande-personnalisation", ligneCommandePersonnalisationRouter);
apiRouter.use("/livraison", livraisonRouter);
apiRouter.use("/livreur", livreurRouter);
apiRouter.use("/lieu-livraison", lieuLivraisonRouter);
apiRouter.use("/methode-livraison", methodeLivraisonRouter);
apiRouter.use('/stock', stockRouter);
apiRouter.use("/stockmaillot", stockmaillotRouter);
apiRouter.use("/stripe", stripeRouter);
apiRouter.use("/facture", factureRouter);
apiRouter.use("/mail", testMailRouter);

apiRouter.use("/retour", retourRouter);
apiRouter.use("/avoir", monMiddlewareBearer, isAdmin, avoirRouter);


app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
});

