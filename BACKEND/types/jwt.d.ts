export interface JwtPayloadCustom {
  id_client: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}