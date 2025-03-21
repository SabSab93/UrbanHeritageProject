
import jwt from 'jsonwebtoken';

export const monMiddlewareBearer = async (req: any, res: any, next: any) => {
  try{
      const fullToken = req.headers.authorization;
    if (!fullToken) {
        res.status(401).send("No token provided");
    }
    else {

      const [typeToken, token] = fullToken.split(" ");
      if(typeToken !== "Bearer"){
          res.status(401).send("Invalid token type");
      }
      else {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        if (decoded) {
          req.token = token;
          next();
        }
        else {
          res.status(401).send("Invalid token");
        }
      }
    }
  } catch (error) {
    return res.status(401).send("Invalid or expired token");
  }
};
