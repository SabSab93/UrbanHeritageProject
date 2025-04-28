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

export const authRouter = Router();
const prisma = new PrismaClient();



// ✅ POST - Inscription CLIENT
authRouter.post("/register-client", async (req, res) => {
  try {
    const { adresse_mail_client } = req.body.data;

    const existing = await prisma.client.findFirst({ where: { adresse_mail_client } });
    if (existing) return res.status(400).json({ message: "Email déjà utilisé" });

    const activationToken = crypto.randomBytes(30).toString("hex");

    await sendMail({
      to: adresse_mail_client,
      subject: "🎉 Bienvenue chez UrbanHeritage - Activez votre compte",
      html: templateActivationCompte(req.body.data.prenom_client || req.body.data.nom_client, activationToken),
    });

    res.status(201).json({
      message: "Email d'activation envoyé. Merci de vérifier vos mails.",
      tempData: {
        ...req.body.data,
        activation_token: activationToken,
      },
    });
  } catch (error) {
    console.error("Erreur dans /register-client :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

/* -------------------------------------------------------------------------- */
/*                       🛡️ 1. Création comptes séparés                        */
/* -------------------------------------------------------------------------- */

// ✅ POST - Inscription ADMIN (protégée)
authRouter.post("/register-admin", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const { data } = req.body;

    const existing = await prisma.client.findFirst({ where: { adresse_mail_client: data.adresse_mail_client } });
    if (existing) return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(data.mot_de_passe, 10);

    const newAdmin = await prisma.client.create({
      data: {
        nom_client: data.nom_client,
        prenom_client: data.prenom_client,
        civilite: data.civilite,
        date_naissance_client: new Date(data.date_naissance_client),
        adresse_client: data.adresse_client,
        code_postal_client: data.code_postal_client,
        ville_client: data.ville_client,
        pays_client: data.pays_client,
        adresse_mail_client: data.adresse_mail_client,
        mot_de_passe: hashedPassword,
        id_role: 1, // Forcé Admin
        statut_compte: "actif",
      },
    });

    await sendMail({
      to: data.adresse_mail_client,
      subject: "🎉 Bienvenue sur UrbanHeritage",
      html: templateBienvenueCompte(data.prenom_client || data.nom_client),
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error("Erreur création admin :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

/* -------------------------------------------------------------------------- */
/*                           2. Activation de compte                          */
/* -------------------------------------------------------------------------- */

authRouter.post("/activate", async (req, res) => {
  const { token, data } = req.body;

  if (!token || !data) {
    return res.status(400).json({ message: "Données d'activation manquantes." });
  }

  try {
    const hashedPassword = await bcrypt.hash(data.mot_de_passe, 10);

    const [jour, mois, annee] = data.date_naissance_client.split("/");
    const parsedDate = new Date(`${annee}-${mois}-${jour}`);

    await prisma.client.create({
      data: {
        nom_client: data.nom_client,
        prenom_client: data.prenom_client,
        civilite: data.civilite,
        date_naissance_client: !isNaN(parsedDate.getTime()) ? parsedDate : undefined,
        adresse_client: data.adresse_client,
        code_postal_client: data.code_postal_client,
        ville_client: data.ville_client,
        pays_client: data.pays_client,
        mot_de_passe: hashedPassword,
        adresse_mail_client: data.adresse_mail_client,
        id_role: 2, // Toujours Client pour activation
        activation_token: null,
        statut_compte: "actif",
      },
    });

    await sendMail({
      to: data.adresse_mail_client,
      subject: "🎉 Bienvenue sur UrbanHeritage",
      html: templateBienvenueCompte(data.prenom_client || data.nom_client),
    });

    res.status(200).json({ message: "Votre compte a été activé avec succès 🎉" });
  } catch (error) {
    console.error("Erreur activation compte :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - Activation compte
authRouter.post("/activate", async (req, res) => {
  const { token, data } = req.body;

  if (!token || !data) {
    return res.status(400).json({ message: "Données d'activation manquantes." });
  }

  try {
    const hashedPassword = await bcrypt.hash(data.mot_de_passe, 10);

    const [jour, mois, annee] = data.date_naissance_client.split("/");
    const parsedDate = new Date(`${annee}-${mois}-${jour}`);

    await prisma.client.create({
      data: {
        nom_client: data.nom_client,
        prenom_client: data.prenom_client,
        civilite: data.civilite,
        date_naissance_client: !isNaN(parsedDate.getTime()) ? parsedDate : undefined,
        adresse_client: data.adresse_client,
        code_postal_client: data.code_postal_client,
        ville_client: data.ville_client,
        pays_client: data.pays_client,
        mot_de_passe: hashedPassword,
        adresse_mail_client: data.adresse_mail_client,
        id_role: data.role === "admin" ? 2 : 1,
        activation_token: null,
        statut_compte: "actif",
      },
    });
    
    await sendMail({
      to: data.adresse_mail_client,
      subject: "🎉 Bienvenue sur UrbanHeritage",
      html: templateBienvenueCompte(data.prenom_client || data.nom_client),
    });
    res.status(200).json({ message: "Votre compte a été activé avec succès 🎉" });

  } catch (error) {
    console.error("Erreur activation compte :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



// ✅ POST - Connexion
authRouter.post("/login", async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const client = await prisma.client.findUnique({
      where: { adresse_mail_client: email },
    });

    if (!client) return res.status(404).json({ message: "Email non trouvé" });

    if (client.statut_compte !== "actif") {
      return res.status(403).json({ message: "Votre compte n'est pas activé. Merci de vérifier vos mails." });
    }

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


// ✅ POST - Réinitialisation mot de passe
authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const client = await prisma.client.findUnique({
      where: { adresse_mail_client: email },
    });

    if (!client) {
      return res.status(404).json({ message: "Aucun compte trouvé avec cet email." });
    }

    const resetToken = crypto.randomBytes(30).toString("hex");

    // Stocker temporairement dans la base
    await prisma.client.update({
      where: { id_client: client.id_client },
      data: {
        activation_token: resetToken, 
      },
    });

    await sendMail({
      to: client.adresse_mail_client,
      subject: "🔑 UrbanHeritage - Réinitialisation de votre mot de passe",
      html: templateForgotPassword(client.prenom_client || client.nom_client, resetToken),
    });

    res.status(200).json({ message: "Email de réinitialisation envoyé. Merci de vérifier votre boite mail." });

  } catch (error) {
    console.error("Erreur dans /forgot-password :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});


authRouter.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Données manquantes." });
  }

  try {
    const client = await prisma.client.findFirst({
      where: { activation_token: token },
    });

    if (!client) {
      return res.status(404).json({ message: "Token invalide ou expiré." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.client.update({
      where: { id_client: client.id_client },
      data: {
        mot_de_passe: hashedPassword,
        activation_token: null, 
      },
    });

    res.status(200).json({ message: "Votre mot de passe a été réinitialisé avec succès." });

  } catch (error) {
    console.error("Erreur dans /reset-password :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
