import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      token?: string;
      decoded?: {
        id_client: number;
        email: string;
        id_role: number;
      };
    }
  }
}
export {};
//"Je vais ajouter des champs custom dans un objet que tu connais déjà, comme req, res, process.env… alors fais-moi confiance et ne me casse pas les pieds avec des erreurs de type."