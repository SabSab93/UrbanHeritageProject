import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { monMiddlewareBearer } from "../../middleware/checkToken";

export const clientRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - Tous les clients
clientRouter.get("/", monMiddlewareBearer, async (req, res) => {
  const clients = await prisma.client.findMany({
    include: { Role: true },
  });
  res.json(clients);
});

// ✅ GET - Client par ID
clientRouter.get("/:id", monMiddlewareBearer, async (req, res) => {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) return res.status(400).json({ message: "ID invalide" });

  const client = await prisma.client.findUnique({
    where: { id_client: clientId },
    include: { Role: true },
  });

  if (!client) return res.status(404).json({ message: "Client non trouvé" });
  res.json(client);
});

// ✅ POST - Inscription
clientRouter.post("/register", async (req, res) => {
  try {
    const { adresse_mail_client, id_role } = req.body.data;

    const existing = await prisma.client.findFirst({ where: { adresse_mail_client } });
    if (existing) return res.status(400).json("Email déjà utilisé");

    const hashedPassword = await bcrypt.hash(req.body.data.mot_de_passe, 10);

    let dateNaissance: Date | null = null;
    if (req.body.data.date_naissance_client) {
      const [jour, mois, annee] = req.body.data.date_naissance_client.split("/");
      const parsedDate = new Date(`${annee}-${mois}-${jour}`);
      if (!isNaN(parsedDate.getTime())) {
        dateNaissance = parsedDate;
      } else {
        return res.status(400).json({ message: "Format de date invalide. Utilisez JJ/MM/AAAA." });
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
        adresse_mail_client,
        id_role: id_role ?? 1, // 1 = client
      },
    });

    const token = jwt.sign(
      {
        id_client: newClient.id_client,
        email: newClient.adresse_mail_client,
        id_role: newClient.id_role, 
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error("Erreur dans /register :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ✅ PUT - Modifier un client
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

  if (data.id_role && req.decoded?.id_role !== 2) {
    return res.status(403).json({ message: "Seul un administrateur peut changer un rôle." });
  }

  let dateNaissance: Date | undefined = undefined;
  if (data.date_naissance_client) {
    const [jour, mois, annee] = data.date_naissance_client.split("/");
    const parsedDate = new Date(`${annee}-${mois}-${jour}`);
    if (!isNaN(parsedDate.getTime())) {
      dateNaissance = parsedDate;
    } else {
      return res.status(400).json({ message: "Format de date invalide. Utilisez JJ/MM/AAAA." });
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
      id_role: data.id_role ?? undefined,
    },
  });

  res.json({ message: "Client mis à jour", client: updatedClient });
});

// ✅ DELETE - Supprimer un client
clientRouter.delete("/:id", async (req, res) => {
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

    if (!client) return res.status(404).json({ message: "Email non trouvé" });

    const passwordValid = await bcrypt.compare(mot_de_passe, client.mot_de_passe);
    if (!passwordValid) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      {
        id_client: client.id_client,
        email: client.adresse_mail_client,
        id_role: client.id_role,
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


// ✅ GET - détails complets pour un client
// clientRouter.ts ou dans une nouvelle route dédiée

clientRouter.get("/:id/details", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID client invalide" });

  try {
    const client = await prisma.client.findUnique({
      where: { id_client: id },
      include: {
        Commande: {
          include: {
            LigneCommande: {
              include: {
                Maillot: true,
                TVA: true,
                LigneCommandePersonnalisation: {
                  include: {
                    Personnalisation: true,
                  },
                },
                LigneCommandeReduction: {
                  include: {
                    Reduction: true,
                  },
                },
              },
            },
            Livraison: {
              include: {
                MethodeLivraison: true,
                LieuLivraison: true,
                Livreur: true,
              },
            },
          },
        },
        Role: true,
      },
    });

    if (!client) return res.status(404).json({ message: "Client non trouvé" });

    res.json(client);
  } catch (error) {
    console.error("Erreur récupération détails client :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


