export const isAdmin = (req: any, res: any, next: any) => {
    if (!req.decoded || !req.decoded.role) {
      return res.status(403).json({ message: "Accès refusé" });
    }
  
    const role = req.decoded.role;
    if (role === "admin" || role === "systeme") {
      next();
    } else {
      return res.status(403).json({ message: "Accès réservé aux administrateurs ou système" });
    }
  };