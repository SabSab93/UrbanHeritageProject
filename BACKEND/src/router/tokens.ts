import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../checkToken";

export const tokenRouter = Router();
const prisma = new PrismaClient();



// **************** POST ****************
tokenRouter.post('/', async (req, res) => {
  try {
    const token = await prisma.token.create({
      data: {
        valeur_token: req.body.data.valeur_token,
        expiration: new Date(req.body.data.expiration),
      },
    });

    // Convert the ID (or any other BigInt) to a string
    const tokenResponse = {
      ...token,
      id_token: token.id_token.toString(), // Convert the BigInt ID to a string
    };

    res.status(201).json(tokenResponse);
  } catch (error: unknown) {  // Specifying that 'error' is of type 'unknown'
    if (error instanceof Error) {  // Type guard to check if it's an instance of Error
      console.error(error.message);
      res.status(500).json({ message: "Error creating the token", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error", error: "An unknown error occurred" });
    }
  }
});


// **************** GET ****************
tokenRouter.get("/", async (req, res) => {
  try {
    const tokens = await prisma.token.findMany();
    
    // Convert BigInt to String
    const tokensFormatted = tokens.map(token => ({
      ...token,
      id_token: token.id_token.toString()
    }));

    res.json(tokensFormatted);
  } catch (error: unknown) {  // Specifying that 'error' is of type 'unknown'
    if (error instanceof Error) {
      console.error("Prisma error:", error.message);
      res.status(500).json({ error: "Server error", details: error.message });
    } else {
      res.status(500).json({ error: "Unknown error", details: "An unknown error occurred" });
    }
  }
});



// **************** GET ID ****************
tokenRouter.get("/:id_token", async (req, res) => {
  let tokenId;
  try {
    tokenId = BigInt(req.params.id_token);
  } catch (e) {
    return res.status(400).json({ message: "Invalid token ID" });
  }

  const token = await prisma.token.findUnique({
    where: { id_token: tokenId },
  });

  if (!token) {
    return res.status(404).json({ message: "Token not found" });
  }
  // Convert the token ID to a string before sending the response
  const tokenResponse = {
    ...token,
    id_token: token.id_token.toString(), // Convert the BigInt ID to a string for the response
  };

  res.json(tokenResponse);
});



// **************** DELETE ****************
tokenRouter.delete("/:id_token", async (req, res) => {
  let tokenId;

  try {
    tokenId = BigInt(req.params.id_token);
  } catch (e) {
    return res.status(400).json({ message: "Invalid token ID" });
  }

  const token = await prisma.token.findUnique({
    where: { id_token: tokenId },
  });

  if (!token) {
    return res.status(404).json({ message: "Token not found" });
  }

  await prisma.token.delete({
    where: { id_token: tokenId },
  });

  res.json({ message: "Token deleted" });
});




// **************** PUT ****************
tokenRouter.put("/:id_token", async (req, res) => {
  let tokenId;

  try {
    // Convertir l'ID du token en BigInt
    tokenId = BigInt(req.params.id_token);
  } catch (e) {
    return res.status(400).json({ message: "Invalid token ID", error: (e instanceof Error) ? e.message : "Unknown error" });
  }

  try {
    // Vérifier si le token existe
    const token = await prisma.token.findUnique({
      where: { id_token: tokenId },
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    // Mettre à jour le token
    const updatedToken = await prisma.token.update({
      where: { id_token: tokenId },
      data: {
        valeur_token: req.body.data.valeur_token,
        expiration: new Date(req.body.data.expiration),
      },
    });

    // Convertir l'ID du token mis à jour en string pour la réponse JSON
    const updatedTokenResponse = {
      ...updatedToken,
      id_token: updatedToken.id_token.toString(), 
    };

    // Retourner le token mis à jour
    res.json(updatedTokenResponse);

  } catch (error: unknown) {  // Specifying that 'error' is of type 'unknown'
    if (error instanceof Error) {
      console.error("Error during token update:", error.message);
      res.status(500).json({ message: "Error during token update", error: error.message });
    } else {
      res.status(500).json({ message: "Error during token update", error: "An unknown error occurred" });
    }
  }
});
