import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const clientRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - tous les clients (protégé)
clientRouter.get("/", monMiddlewareBearer, async (req, res) => {
  const clients = await prisma.client.findMany();
  res.json(clients);
});

// ✅ GET - client par ID (protégé)
clientRouter.get("/:id", monMiddlewareBearer, async (req, res) => {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) return res.status(400).json({ message: "ID invalide" });

  const client = await prisma.client.findUnique({
    where: { id_client: clientId },
  });

  if (!client) return res.status(404).json({ message: "Client non trouvé" });
  res.json(client);
});

// ✅ POST - inscription (public)
clientRouter.post("/register", async (req, res) => {
  try {
    const { adresse_mail_client } = req.body.data;

    const existing = await prisma.client.findFirst({
      where: { adresse_mail_client }
    });

    if (existing) {
      return res.status(400).json("Email déjà utilisé");
    }

    const hashedPassword = await bcrypt.hash(req.body.data.mot_de_passe, 10);

    let dateNaissance: Date | null = null;
    if (req.body.data.date_naissance_client) {
      const [jour, mois, annee] = req.body.data.date_naissance_client.split("/");
      const parsedDate = new Date(`${annee}-${mois}-${jour}`);
      if (!isNaN(parsedDate.getTime())) {
        dateNaissance = parsedDate;
      } else {
        return res.status(400).json({
          message: "Format de date invalide. Utilisez JJ/MM/AAAA."
        });
      }
    }

    const newClient = await prisma.client.create({
      data: {
        nom_client: req.body.data.nom_client,
        prenom_client: req.body.data.prenom_client,
        civilite: req.body.data.civilite,
        date_naissance_client: dateNaissance,
        adresse_client: req.body.data.adresse_client,
        code_postal_client: req.body.data.code_postal_client,
        ville_client: req.body.data.ville_client,
        pays_client: req.body.data.pays_client,
        mot_de_passe: hashedPassword,
        adresse_mail_client: adresse_mail_client,
      },
    });

    const token = jwt.sign(
      {
        id_client: newClient.id_client,
        email: newClient.adresse_mail_client,
        role: newClient.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    return res.status(201).json({ token });
  } catch (error) {
    console.error("Erreur dans /register :", error);
    return res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ✅ PUT - modification (protégé)
clientRouter.put("/:id", monMiddlewareBearer, async (req, res) => {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) return res.status(400).json({ message: "ID invalide" });

  const existing = await prisma.client.findUnique({ where: { id_client: clientId } });
  if (!existing) return res.status(404).json({ message: "Client non trouvé" });

  const data = req.body.data;
  let hashedPassword = existing.mot_de_passe;

  if (data.mot_de_passe) {
    hashedPassword = await bcrypt.hash(data.mot_de_passe, 10);
  }

  if (data.role && req.decoded?.role !== "admin") {
    return res.status(403).json({ message: "Seul un administrateur peut changer un rôle." });
  }

  let dateNaissance: Date | undefined = undefined;
  if (data.date_naissance_client) {
    const [jour, mois, annee] = data.date_naissance_client.split("/");
    const parsedDate = new Date(`${annee}-${mois}-${jour}`);
    if (!isNaN(parsedDate.getTime())) {
      dateNaissance = parsedDate;
    } else {
      return res.status(400).json({ message: "Format de date invalide. Utiliser JJ/MM/AAAA." });
    }
  }

  const updatedClient = await prisma.client.update({
    where: { id_client: clientId },
    data: {
      nom_client: data.nom_client ?? undefined,
      prenom_client: data.prenom_client ?? undefined,
      civilite: data.civilite ?? undefined,
      date_naissance_client: dateNaissance ?? undefined,
      adresse_client: data.adresse_client ?? undefined,
      code_postal_client: data.code_postal_client ?? undefined,
      ville_client: data.ville_client ?? undefined,
      pays_client: data.pays_client ?? undefined,
      mot_de_passe: hashedPassword,
      role: data.role ?? undefined,
    },
  });

  res.json({ message: "Client mis à jour", client: updatedClient });
});

// ✅ DELETE - suppression (protégé)
clientRouter.delete("/:id", monMiddlewareBearer, async (req, res) => {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) return res.status(400).json({ message: "ID invalide" });

  const client = await prisma.client.findUnique({ where: { id_client: clientId } });
  if (!client) return res.status(404).json({ message: "Client non trouvé" });

  await prisma.client.delete({ where: { id_client: clientId } });

  res.json({ message: "Client supprimé" });
});


// ✅ POST - Connexion
clientRouter.post("/login", async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const client = await prisma.client.findUnique({
      where: { adresse_mail_client: email },
    });

    if (!client) {
      return res.status(404).json({ message: "Email non trouvé" });
    }
    console.log("Client trouvé :", client);
    const passwordValid = await bcrypt.compare(mot_de_passe, client.mot_de_passe);
    if (!passwordValid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      {
        id_client: client.id_client,
        email: client.adresse_mail_client,
        role: client.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.json({ token, client });
  } catch (error) {
    console.error("Erreur dans /login :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});