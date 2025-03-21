import cors from "cors";
import "dotenv/config";
import express from "express";

import { PrismaClient } from "@prisma/client";

import { userRouter } from "./router/users";
import { instrumentRouter } from "./router/instruments";
import { bananeRouter } from "./router/bananes";
import { reparationRouter } from "./router/reparations";
import { monMiddlewareBearer } from "./checkToken";


export const prisma = new PrismaClient();

const app = express();

app.use(cors()); 
app.use(express.json());

const apiRouterBanane = express.Router()
apiRouterBanane.use(bananeRouter)

const apiRouter = express.Router();


apiRouter.use("/auth", userRouter)
apiRouter.use("/instruments", instrumentRouter)
apiRouter.use("/reparations",monMiddlewareBearer, reparationRouter)

app.use("/api", apiRouter);

app.use(apiRouter);

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
});
