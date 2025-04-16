import cors from "cors";
import "dotenv/config";
import express from "express";

import { PrismaClient } from "@prisma/client";

import { utilisateurRouter } from "./router/clients";
import { maillotRouter } from "./router/maillots";
import { monMiddlewareBearer } from "./checkToken";


export const prisma = new PrismaClient();

const app = express();

app.use(cors()); 
app.use(express.json());



const apiRouter = express.Router();


apiRouter.use("/auth", utilisateurRouter)
apiRouter.use("/maillot", maillotRouter);
// apiRouter.use("/reparations",monMiddlewareBearer, )

app.use("/api", apiRouter);

app.use(apiRouter);

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
});

