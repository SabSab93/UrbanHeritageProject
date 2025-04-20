export const isAdmin = (req: any, res: any, next: any) => {
  if (!req.decoded || typeof req.decoded.id_role !== "number") {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const idRole = req.decoded.id_role;
  
  if (idRole === 2 || idRole === 3) {
    next();
  } else {
    return res.status(403).json({ message: "Accès réservé aux administrateurs ou système" });
  }
};
