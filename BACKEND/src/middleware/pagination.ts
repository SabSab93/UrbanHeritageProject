import { Request, Response, NextFunction } from "express";

interface Pagination {
  limit: number;
  offset: number;
}

declare global {
  namespace Express {
    interface Request {
      pagination?: Pagination;
    }
  }
}

export function paginationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Lecture des paramètres de requête
  const limitParam = req.query.limit as string;
  const offsetParam = req.query.offset as string;

  // Valeurs par défaut si non renseignées
  const DEFAULT_LIMIT = 50;
  const DEFAULT_OFFSET = 0;

  // Conversion en entiers
  const limit = limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT;
  const offset = offsetParam ? parseInt(offsetParam, 10) : DEFAULT_OFFSET;

  // Validation : limit > 0, offset >= 0 et pas NaN
  if (
    Number.isNaN(limit) ||
    limit <= 0 ||
    Number.isNaN(offset) ||
    offset < 0
  ) {
    return res
      .status(400)
      .json({ message: "Paramètres de pagination invalides" });
  }

  // On attache l’objet pagination à req pour y accéder ensuite
  req.pagination = { limit, offset };
  next();
}
