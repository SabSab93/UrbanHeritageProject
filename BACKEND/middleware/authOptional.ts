// src/middleware/authOptional.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export function authOptional(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization?.split(' ')[1];
  if (auth) {
    try {
      // si le token est valide, on le pose dans req.decoded
      const payload = jwt.verify(auth, SECRET);
      (req as any).decoded = payload;
    } catch (err) {
      // token invalide → on l'ignore, pas de blocage
      console.warn('authOptional: token invalide, on continue en invité');
    }
  }
  // si pas de header, on ne fait rien, on continue en invité
  next();
}
