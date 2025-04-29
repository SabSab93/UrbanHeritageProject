import { Router } from "express";
import { PrismaClient, provider_enum } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";
import { sendMail } from "../utils/mailService";
import { templateActivationCompte } from "../templateMails/compte/activationCompte";
import { templateBienvenueCompte } from "../templateMails/compte/bienvenueCompte";
import { templateForgotPassword } from "../templateMails/compte/resetMotDePasse";

import { OAuth2Client } from "google-auth-library";
import { findOrCreateUser } from "../utils/findOrCreateUser";

export const authRouter = Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* -------------------------------------------------------------------------- */
/*                           1. Inscription "local"                           */
/* -------------------------------------------------------------------------- */

authRouter.post("/register-client", async (req, res) => {
  try {
    const data = req.body.data;

    const emailInUse = await prisma.client.findUnique({
      where: { adresse_mail_client: data.adresse_mail_client },
    });
    if (emailInUse) return res.status(400).json({ message: "Email déjà utilisé" });

    // Stocke le compte en attente d'activation (password déjà hashé)
    const hashed = await bcrypt.hash(data.mot_de_passe, 10);
    const activationToken = crypto.randomBytes(30).toString("hex");

    await prisma.client.create({
      data: {
        provider: provider_enum.local,
        activation_token: activationToken,
        statut_compte: "en_attente",
        mot_de_passe: hashed,
        id_role: 2, // client
        ...data,
      },
    });

    await sendMail({
      to: data.adresse_mail_client,
      subject: "🎉 Bienvenue chez UrbanHeritage - Activez votre compte",
      html: templateActivationCompte(data.prenom_client || data.nom_client, activationToken),
    });

    return res.status(201).json({ message: "Email d'activation envoyé." });
  } catch (err) {
    console.error("/register-client", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------------------------- */
/*                         2. Activation via lien mail                        */
/* -------------------------------------------------------------------------- */

authRouter.post("/activate/:token", async (req, res) => {
  const { token } = req.params;
  const { mot_de_passe } = req.body; // champs éventuellement modifiables

  try {
    const client = await prisma.client.findFirst({ where: { activation_token: token } });
    if (!client) return res.status(404).json({ message: "Token invalide ou expiré." });

    await prisma.client.update({
      where: { id_client: client.id_client },
      data: {
        statut_compte: "actif",
        activation_token: null,
        mot_de_passe: mot_de_passe ? await bcrypt.hash(mot_de_passe, 10) : client.mot_de_passe,
      },
    });

    await sendMail({
      to: client.adresse_mail_client,
      subject: "🎉 Bienvenue sur UrbanHeritage",
      html: templateBienvenueCompte(client.prenom_client || client.nom_client),
    });

    return res.status(200).json({ message: "Compte activé avec succès." });
  } catch (err) {
    console.error("/activate", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------------------------- */
/*                       3. Connexion classique (email/pwd)                   */
/* -------------------------------------------------------------------------- */

authRouter.post("/login", async (req, res) => {
  const { email, mot_de_passe } = req.body;
  try {
    const client = await prisma.client.findUnique({ where: { adresse_mail_client: email } });
    if (!client) return res.status(404).json({ message: "Email non trouvé" });

    if (client.provider !== provider_enum.local)
      return res.status(400).json({ message: "Veuillez utiliser la connexion Google." });

    if (client.statut_compte !== "actif")
      return res.status(403).json({ message: "Compte non activé" });

    const ok = await bcrypt.compare(mot_de_passe, client.mot_de_passe!);
    if (!ok) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id_client: client.id_client, id_role: client.id_role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );
    return res.json({ token, client });
  } catch (err) {
    console.error("/login", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------------------------- */
/*                          4. Google Sign-In (JWT)                           */
/* -------------------------------------------------------------------------- */

authRouter.post("/google", async (req, res) => {
  try {
    const { credential } = req.body; // id_token reçu du front
    if (!credential) return res.status(400).json({ message: "Pas de token Google" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified)
      return res.status(400).json({ message: "Email Google non vérifié" });

    const client = await findOrCreateUser({
      email: payload.email!,
      googleSub: payload.sub!,
      name: payload.name,
    });

    const token = jwt.sign(
      { id_client: client.id_client, id_role: client.id_role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );
    return res.json({ token, client });
  } catch (err) {
    console.error("/google", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------------------------- */
/*                    5. Mot de passe oublié / réinitialisation               */
/* -------------------------------------------------------------------------- */

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const client = await prisma.client.findUnique({ where: { adresse_mail_client: email } });
    if (!client || client.provider !== provider_enum.local)
      return res.status(404).json({ message: "Compte introuvable ou Google Sign-In" });

    const resetToken = crypto.randomBytes(30).toString("hex");
    await prisma.client.update({ where: { id_client: client.id_client }, data: { activation_token: resetToken } });

    await sendMail({
      to: client.adresse_mail_client,
      subject: "🔑 UrbanHeritage – Réinitialisation de votre mot de passe",
      html: templateForgotPassword(client.prenom_client || client.nom_client, resetToken),
    });
    return res.json({ message: "Email envoyé" });
  } catch (err) {
    console.error("/forgot-password", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

authRouter.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ message: "Mot de passe manquant" });

  try {
    const client = await prisma.client.findFirst({ where: { activation_token: token } });
    if (!client) return res.status(404).json({ message: "Token invalide" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.client.update({
      where: { id_client: client.id_client },
      data: { mot_de_passe: hashed, activation_token: null },
    });
    return res.json({ message: "Mot de passe réinitialisé" });
  } catch (err) {
    console.error("/reset-password", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------------------------- */
/*                             6. Register admin                              */
/* -------------------------------------------------------------------------- */

authRouter.post("/register-admin", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const data = req.body.data;
    const exists = await prisma.client.findUnique({ where: { adresse_mail_client: data.adresse_mail_client } });
    if (exists) return res.status(400).json({ message: "Email déjà utilisé" });

    const hashed = await bcrypt.hash(data.mot_de_passe, 10);
    const admin = await prisma.client.create({
      data: {
        provider: provider_enum.local,
        ...data,
        mot_de_passe: hashed,
        statut_compte: "actif",
        id_role: 1,
      },
    });
    await sendMail({
      to: data.adresse_mail_client,
      subject: "🎉 Bienvenue sur UrbanHeritage",
      html: templateBienvenueCompte(data.prenom_client || data.nom_client),
    });
    return res.status(201).json(admin);
  } catch (err) {
    console.error("register-admin", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});
