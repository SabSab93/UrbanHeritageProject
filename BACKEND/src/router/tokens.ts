import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import * as crypto from 'crypto';

export const tokenRouter = Router();
const prisma = new PrismaClient();

// Fonction pour générer un token unique
async function generateUniqueToken() {
  let token;
  let tokenExists;

  do {
    token = crypto.randomBytes(32).toString("hex"); // Génère un token sécurisé
    console.log("Generated token:", token); // Log pour voir le token généré

    tokenExists = await prisma.token.findUnique({ where: { valeur_token: token } });
    console.log("Token exists:", tokenExists); // Log pour vérifier si le token existe déjà
  } while (tokenExists); // Vérifie si le token existe déjà

  return token;
}

// **************** POST ****************
tokenRouter.post("/", async (req, res) => {
  try {
    // Générer un token unique
    const generatedToken = await generateUniqueToken();

    const creationDate = new Date();
    const expirationDate = new Date(creationDate.getTime() + 24 * 60 * 60 * 1000); // 24h
    console.log("Creation date:", creationDate);
    console.log("Expiration date:", expirationDate);

    const { id_utilisateur } = req.body; // Assurez-vous que l'ID de l'utilisateur est passé dans le corps de la requête.

    // Vérifier si l'id_utilisateur est valide
    const utilisateur = await prisma.utilisateur.findUnique({ where: { id_utilisateur } });
    if (!utilisateur) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Créer un nouveau token dans la base de données
    const token = await prisma.token.create({
      data: {
        valeur_token: generatedToken,
        date_expiration: expirationDate,
        date_creation: creationDate,
        id_utilisateur,
      },
    });

    console.log("Token inserted into the database:", token);
    res.json(token);
  } catch (error: unknown) {
    console.error("Error occurred while generating token:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    res.status(500).json({ error: "An error occurred while generating the token." });
  }
});

// **************** GET ****************
tokenRouter.get("/", async (req, res) => {
  try {
    const tokens = await prisma.token.findMany();

    const tokensFormatted = tokens.map((token) => ({
      id_token: token.id_token,
      valeur_token: token.valeur_token,
      date_expiration: token.date_expiration,
      date_creation: token.date_creation,
    }));

    res.json(tokensFormatted);
  } catch (error: unknown) {
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
  try {
    const token = await prisma.token.findUnique({
      where: { id_token: BigInt(req.params.id_token) }, // Recherche par id_token
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    // Retourner le token sans l'inclure dans la réponse
    const { id_token, ...tokenResponse } = token;
    res.json(tokenResponse); // Renvoi des données sans l'ID du token
  } catch (error: unknown) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred", details: error });
  }
});

// **************** DELETE ****************
tokenRouter.delete("/:id_token", async (req, res) => {
  try {
    const token = await prisma.token.findUnique({
      where: { id_token: BigInt(req.params.id_token) }, // Recherche par id_token
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    await prisma.token.delete({
      where: { id_token: BigInt(req.params.id_token) }, // Suppression du token
    });

    res.json({ message: "Token deleted" });
  } catch (error: unknown) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred", details: error });
  }
});

