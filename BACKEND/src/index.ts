import cors from "cors";
import "dotenv/config";
import express from "express";

import { PrismaClient } from "@prisma/client";

import { clientRouter } from "./router/clients";
import { maillotRouter } from "./router/maillots";
import { artisteRouter } from "./router/artistes";
import { associationRouter } from "./router/associations";


import { monMiddlewareBearer } from "./checkToken";
import { avisRouter } from "./router/avis";
import { ligneCommandeRouter } from "./router/lignecommandes";
import { commandeRouter } from "./router/commandes";



export const prisma = new PrismaClient();

const app = express();

app.use(cors()); 
app.use(express.json());



const apiRouter = express.Router();


app.use("/api", apiRouter); 


apiRouter.use("/auth", clientRouter)
apiRouter.use("/maillot", maillotRouter);
app.use("/api/artiste", artisteRouter);
app.use("/api/association", associationRouter);
app.use("/api/avis", avisRouter);
apiRouter.use("/lignecommande", ligneCommandeRouter);
apiRouter.use("/commande", monMiddlewareBearer, commandeRouter);
// apiRouter.use("/reparations",monMiddlewareBearer, )



app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
});

