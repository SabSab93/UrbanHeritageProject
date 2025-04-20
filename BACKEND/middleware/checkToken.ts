
import jwt from 'jsonwebtoken';

export const monMiddlewareBearer = async (req: any, res: any, next: any) => {
  try {
    const fullToken = req.headers.authorization;

    if (!fullToken) return res.status(401).send("No token provided");

    const [typeToken, token] = fullToken.split(" ");
    if (typeToken !== "Bearer") return res.status(401).send("Invalid token type");

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.token = token;
    req.decoded = decoded; // 👈 on stocke le `decoded` ici pour toutes les routes
    next();

  } catch (error) {
    return res.status(401).send("Invalid or expired token");
  }
};
