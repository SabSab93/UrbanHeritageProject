import jwt from 'jsonwebtoken';

const ACCESS_TTL  = '15m';          // court
const REFRESH_TTL = '7d';           // long
const ACCESS_KEY  = process.env.JWT_SECRET!;        // même clé ou clé dédiée
const REFRESH_KEY = process.env.JWT_REFRESH_SECRET!; // clé différente conseillée

export function signAccess(id_client: number, id_role: number | null) {
  return jwt.sign({ id_client, id_role }, ACCESS_KEY, { expiresIn: ACCESS_TTL });
}

export function signRefresh(id_client: number) {
  // payload minimal : juste l’id
  return jwt.sign({ id_client }, REFRESH_KEY, { expiresIn: REFRESH_TTL });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, ACCESS_KEY) as { id_client: number; id_role: number | null };
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, REFRESH_KEY) as { id_client: number };
}
