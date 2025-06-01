import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";


function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    // On interdit tout HTML/JS, on renvoie la version échappée
    return sanitizeHtml(obj, { allowedTags: [], allowedAttributes: {} });
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === "object") {
    const copy: any = {};
    for (const key of Object.keys(obj)) {
      copy[key] = sanitizeObject(obj[key]);
    }
    return copy;
  }

  return obj;
}

export function xssGuardMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    next();
  } catch (e) {
    console.error("Erreur lors de la désinfection des champs :", e);
    return res.status(500).json({ message: "Erreur de désinfection XSS" });
  }
}
