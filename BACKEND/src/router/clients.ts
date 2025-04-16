import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const utilisateurRouter = Router();
const prisma = new PrismaClient();

// POST
utilisateurRouter.post('/register', async (req, res) => {
  try {
    const { adresse_mail_client } = req.body.data;
    const userWithEmail = await prisma.client.findFirst({ where: { adresse_mail_client } });

    if (userWithEmail) {
      return res.status(400).json("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(req.body.data.mot_de_passe, 10);

    const newUser = await prisma.client.create({
      data: {
        nom_client: req.body.data.nom_client,
        prenom_client: req.body.data.prenom_client,
        civilite: req.body.data.civilite,
        date_naissance_client: new Date(req.body.data.date_naissance_client),
        adresse_client: req.body.data.adresse_client,
        code_postal_client: req.body.data.code_postal_client,
        ville_client: req.body.data.ville_client,
        pays_client: req.body.data.pays_client,
        mot_de_passe: hashedPassword,
        adresse_mail_client: req.body.data.adresse_mail_client
      }
    });

    const token = jwt.sign({ adresse_mail_client: newUser.adresse_mail_client }, process.env.JWT_SECRET!);
    return res.status(201).json({ token });

  } catch (error) {
    console.error("Erreur dans /register :", error);
    return res.status(500).json({ message: "Erreur serveur", error });
  }
});


// GET
utilisateurRouter.get("/", async (req, res) => {
  const users = await prisma.client.findMany();
  res.json(users);
});

// GET ID
utilisateurRouter.get("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await prisma.client.findUnique({
    where: { id_client: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// DELETE
utilisateurRouter.delete("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await prisma.client.findUnique({
    where: { id_client: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await prisma.client.delete({
    where: { id_client: userId },
  });

  res.json({ message: "User deleted" });
});

// PUT
utilisateurRouter.put("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await prisma.client.findUnique({
    where: { id_client: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let hashedPassword = user.mot_de_passe;

  if (req.body.data.mot_de_passe) {
    hashedPassword = await bcrypt.hash(req.body.data.mot_de_passe, 10);
  }

  const updatedUser = await prisma.client.update({
    where: { id_client: userId },
    data: {
      nom_client: req.body.data.nom_client,
      prenom_client: req.body.data.prenom_client,
      civilite: req.body.data.civilite,
      date_naissance_client: req.body.data.date_naissance_client,
      adresse_client: req.body.data.adresse_client,
      code_postal_client: req.body.data.code_postal_client,
      ville_client: req.body.data.ville_client,
      pays_client: req.body.data.pays_client,
      mot_de_passe: hashedPassword,
    },
  });

  res.json({ message: "User updated" });
});
