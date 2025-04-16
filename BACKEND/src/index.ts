import cors from "cors";
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { tokenHandler } from './middleware/tokenHandler';
import { PrismaClient } from "@prisma/client";

import { tokenRouter } from "./router/tokens";
// import { userRouter } from "./router/users";
// import { reparationRouter } from "./router/reparations";
import { monMiddlewareBearer } from "./checkToken";

export const prisma = new PrismaClient();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(cookieParser()); 
app.use(tokenHandler);   

// Routes API
const apiRouter = express.Router();

// apiRouter.use("/auth", userRouter);
apiRouter.use("/tokens", tokenRouter);
// apiRouter.use("/reparations", monMiddlewareBearer, reparationRouter);

app.use("/api", apiRouter);

// Route utilitaire
app.get("/api-url", (req, res) => {
  res.json({ apiUrl: `http://localhost:${process.env.PORT}/api` });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

export default app;
