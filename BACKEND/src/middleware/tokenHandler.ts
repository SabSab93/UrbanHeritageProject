// middleware/tokenHandler.ts
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function generateUniqueToken(): Promise<string> {
  let token;
  let tokenExists;
  do {
    token = crypto.randomBytes(32).toString("hex");
    tokenExists = await prisma.token.findUnique({ where: { valeur_token: token } });
  } while (tokenExists);
  return token;
}

export async function tokenHandler(req: Request, res: Response, next: NextFunction) {
  const cookieName = "uh_token";
  let token = req.cookies?.[cookieName];

  if (token) {
    // Vérifier l'existence du token dans la base
    const tokenRecord = await prisma.token.findUnique({
      where: { valeur_token: token },
      include: { Utilisateur: true }
    });

    if (tokenRecord) {
      const now = new Date();
      const newExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Met à jour la date d'expiration
      await prisma.token.update({
        where: { valeur_token: token },
        data: { date_expiration: newExpiration, date_creation: now },
      });

      res.cookie(cookieName, token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
      req.utilisateur  = tokenRecord.Utilisateur; // Injection de l’utilisateur dans la requête
      return next();
    }
  }

  // Si le token n'existe pas ou n'est pas valide, on crée un nouvel utilisateur + token
  const newUser = await prisma.utilisateur.create({
    data: {
      nom_account: "Visiteur",
    },
  });

  const newToken = await generateUniqueToken();
  const now = new Date();
  const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.token.create({
    data: {
      valeur_token: newToken,
      id_utilisateur: newUser.id_utilisateur,
      date_creation: now,
      date_expiration: expiration,
    },
  });

  res.cookie(cookieName, newToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
  req.utilisateur  = newUser;
  next();
}
