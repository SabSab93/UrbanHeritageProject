// src/types/express/index.d.ts
import { Utilisateur } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      utilisateur?: Utilisateur; 
    }
  }
}
