import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function monMiddlewareBearer(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();     
  }

  const full = req.headers.authorization;
  if (!full) return res.status(401).send('No token provided');

  const [scheme, token] = full.split(' ');
  if (scheme !== 'Bearer') return res.status(401).send('Invalid token type');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).token   = token;
    (req as any).decoded = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid or expired token');
  }
}

