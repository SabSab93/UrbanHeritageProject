import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { sendMail } from "../utils/mailService"; 
import crypto from "crypto"; 
import { templateActivationCompte } from "../templateMails/compte/activationCompte";
import { isAdmin } from "../../middleware/isAdmin";
import { templateBienvenueCompte } from "../templateMails/compte/bienvenueCompte";
import { templateForgotPassword } from "../templateMails/compte/resetMotDePasse";
import { anonymiseClient } from "../utils/anonymiseClient";

export const clientRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - Tous les clients
clientRouter.get("/", monMiddlewareBearer,isAdmin, async (req, res) => {
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


// ✅ GET - Détail complet client
clientRouter.get("/:id/details",monMiddlewareBearer, async (req, res) => {
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

// ✅ DELETE - Supprimer un client
clientRouter.delete("/:id", monMiddlewareBearer, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  // ⚠️ Seul le client lui-même OU un admin peut déclencher la suppression
  const isSelf  = req.decoded?.id_client === id;
  const isAdmin = req.decoded?.id_role   === 1;
  if (!isSelf && !isAdmin)
    return res.status(403).json({ message: "Accès interdit" });

  try {
    const clientAnonymise = await anonymiseClient(id);
    return res
      .status(200)
      .json({ message: "Compte anonymisé conformément au RGPD ✅", client: clientAnonymise });
  } catch (e: any) {
    console.error("Erreur anonymisation client :", e);
    return res.status(500).json({ message: "Erreur serveur", details: e.message });
  }
});