import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../checkToken";

export const tokenRouter = Router();
const prisma = new PrismaClient();


// POST
// tokenRouter.post('/', async (req, res) => {
//   const token = await prisma.token.create({
//     data : {
//       valeur_token : req.body.data.valeur_token,
//       expiration : req.body.data.expiration
//     }
//   });
//   res.status(201).json(token);
// })


tokenRouter.post("/", async (req, res) => {
  try {
    const { valeur_token, expiration } = req.body.data;

    // Créer un nouveau token dans la base de données
    const newToken = await prisma.token.create({
      data: {
        valeur_token: valeur_token,
        expiration: new Date(expiration), // Assurez-vous que 'expiration' est au format Date
      },
    });

    res.status(201).json(newToken); // Retourne le token créé
  } catch (error) {
    console.error("Prisma error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});


// // POST
// tokenRouter.post('/', monMiddlewareBearer, async (req, res) => {
//   const token = await prisma.token.create({
//     data : {
//       valeur_token : req.body.data.valeur_token,
//       expiration : req.body.data.expiration
//     }
//   });
//   res.status(201).json(token);
// })




tokenRouter.get("/", async (req, res) => {
  try {
    const tokens = await prisma.token.findMany();
    
    // Convert BigInt to String
    const tokensFormatted = tokens.map(token => ({
      ...token,
      id_token: token.id_token.toString()
    }));

    res.json(tokensFormatted);
  } catch (error) {
    console.error("Prisma error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});



//GET ID
tokenRouter.get("/:id_token", async (req, res) => {
  const tokenId = parseInt(req.params.id_token);

  if (isNaN(tokenId)) {
    return res.status(400).json({ message: "Invalid token ID" });
  }

  const token = await prisma.token.findUnique({
    where: { id_token: tokenId },
  });

  if (!token) {
    return res.status(404).json({ message: "token not found" });
  }

  res.json(token);
});


//DELETE
tokenRouter.delete("/:id_token", async (req, res) => {
  const tokenId = parseInt(req.params.id_token);

  if (isNaN(tokenId)) {
    return res.status(400).json({ message: "Invalid token ID" });
  }

  const token = await prisma.token.findUnique({
    where: { id_token: tokenId },
  });

  if (!token) {
    return res.status(404).json({ message: "token not found" });
  }

  await prisma.token.delete({
    where: { id_token: tokenId },
  });

  res.json({ message: "token deleted" });
});


//PUT 
tokenRouter.put("/:id_token", async (req, res) => {
  const tokenId = parseInt(req.params.id_token);

  if (isNaN(tokenId)) {
    return res.status(400).json({ message: "Invalid token ID" });
  }

  const token = await prisma.token.findUnique({
    where: { id_token: tokenId },
  });

  if (!token) {
    return res.status(404).json({ message: "token not found" });
  }

  const updatetokenId = await prisma.token.update({
    where: { id_token: tokenId },
    data: {
      valeur_token : req.body.data.valeur_token,
      expiration : req.body.data.expiration
    },
  });

  res.json(updatetokenId);
});