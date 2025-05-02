import { Router, Request, Response } from "express";
import { PrismaClient, provider_enum } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

import { sendMail } from "../utils/mailService";
import { templateActivationCompte } from "../templateMails/compte/activationCompte";
import { templateBienvenueCompte } from "../templateMails/compte/bienvenueCompte";
import { templateForgotPassword } from "../templateMails/compte/resetMotDePasse";
import { findOrCreateUser } from "../utils/findOrCreateUser";

export const authRouter = Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/*** Utils *******************************************************************/
/** Génère un JWT valable 24 h pour le client donné. */
const generateJwt = (idClient: number, idRole: number | null) =>
  jwt.sign({ id_client: idClient, id_role: idRole }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });

/*** Inscription locale (client) *******************************************/
authRouter.post("/register-client", async (req: Request, res: Response) => {
  try {
    const clientData = req.body?.data;
    if (!clientData)
      return res.status(400).json({ message: "Corps de requête manquant" });
    const emailExists = await prisma.client.findUnique({
      where: { adresse_mail_client: clientData.adresse_mail_client },
    });
    if (emailExists)
      return res.status(400).json({ message: "Email déjà utilisé" });
    const hashedPassword = await bcrypt.hash(clientData.mot_de_passe, 10);
    const activationToken = crypto.randomBytes(30).toString("hex");
    clientData.date_naissance_client = new Date(clientData.date_naissance_client);
    await prisma.client.create({
      data: {
        ...clientData, 
        mot_de_passe: hashedPassword,
        provider: provider_enum.local,
        activation_token: activationToken,
        statut_compte: "en_attente",
        id_role: 2
      }
    });
    await sendMail({
      to: clientData.adresse_mail_client,
      subject: "🎉 Bienvenue chez UrbanHeritage - Activez votre compte",
      html: templateActivationCompte(
        clientData.prenom_client || clientData.nom_client,
        activationToken
      ),
    });
    res.status(201).json({ message: "Email d'activation envoyé." });
  } catch (error) {
    console.error("/register-client", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/*** Activation via lien e‑mail ********************************************/
authRouter.post("/activate/:token", async (req, res) => {
  const activationToken = req.params.token;
  try {
    const client = await prisma.client.findFirst({
      where: { activation_token: activationToken },
    });

    if (!client)
      return res.status(404).json({ message: "Lien d’activation invalide ou expiré." });

    if (client.statut_compte === "actif") {
      if (client.activation_token) {
        await prisma.client.update({
          where: { id_client: client.id_client },
          data: { activation_token: null },
        });
      }
      return res.status(400).json({ message: "Ce compte est déjà activé." });
    }

    const updatedClient = await prisma.client.update({
      where: { id_client: client.id_client },
      data: {
        statut_compte: "actif",
        activation_token: null,
      },
    });

    await sendMail({
      to: updatedClient.adresse_mail_client,
      subject: "🎉 Bienvenue sur UrbanHeritage",
      html: templateBienvenueCompte(updatedClient.prenom_client || updatedClient.nom_client),
    });

    const token = generateJwt(updatedClient.id_client, updatedClient.id_role);

    res.json({
      message: "Compte activé avec succès.",
      token,
      client: {
        id_client: updatedClient.id_client,
        nom_client: updatedClient.nom_client,
        prenom_client: updatedClient.prenom_client,
        adresse_mail_client: updatedClient.adresse_mail_client,
        // ajoute ce que tu veux retourner
      }
    });
  } catch (error) {
    console.error("/activate", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/*** Connexion locale ******************************************************/
authRouter.post("/login", async (req, res) => {
  const { email, mot_de_passe: password } = req.body;
  try {
    const client = await prisma.client.findUnique({
      where: { adresse_mail_client: email },
    });
    const loginOk =
      client &&
      client.provider === provider_enum.local &&
      client.statut_compte === "actif" &&
      (await bcrypt.compare(password, client.mot_de_passe!));
    if (!loginOk) {
      await new Promise((r) => setTimeout(r, 1000));
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    const token = generateJwt(client.id_client, client.id_role);
    res.json({ token, client });
  } catch (error) {
    console.error("/login", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Connexion Google ******************************************************/
authRouter.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ message: "Token Google manquant" });

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

    const token = generateJwt(client.id_client, client.id_role);
    res.json({ token, client });
  } catch (error) {
    console.error("/google", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Mot de passe oublié / réinitialisation **************************************/
authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const client = await prisma.client.findUnique({
      where: { adresse_mail_client: email },
    });
    if (!client || client.provider !== provider_enum.local)
      return res.status(404).json({ message: "Compte introuvable" });

    const resetToken = crypto.randomBytes(30).toString("hex");
    await prisma.client.update({
      where: { id_client: client.id_client },
      data: { activation_token: resetToken },
    });
    console.log("Envoi mail reset vers :", client.adresse_mail_client);
    await sendMail({
      to: client.adresse_mail_client,
      subject: "🔑 UrbanHeritage – Réinitialisation de votre mot de passe",
      html: templateForgotPassword(
        client.prenom_client || client.nom_client,
        resetToken
      ),
    });
    res.json({ message: "Email envoyé" });
  } catch (error) {
    console.error("/forgot-password", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

authRouter.post("/reset-password/:token", async (req, res) => {
  const resetToken = req.params.token;
  const { newPassword } = req.body;
  if (!newPassword)
    return res.status(400).json({ message: "Mot de passe manquant" });

  try {
    const client = await prisma.client.findFirst({
      where: { activation_token: resetToken },
    });
    if (!client)
      return res.status(404).json({ message: "Token invalide" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.client.update({
      where: { id_client: client.id_client },
      data: { mot_de_passe: hashedPassword, activation_token: null },
    });
    res.json({ message: "Mot de passe réinitialisé" });
  } catch (error) {
    console.error("/reset-password", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/*** Creation Admin *********************************************************/
authRouter.post("/register-admin", monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const adminData = req.body.data;
    if (!adminData)
      return res.status(400).json({ message: "Corps de requête manquant" });

    const adminExists = await prisma.client.findUnique({
      where: { adresse_mail_client: adminData.adresse_mail_client },
    });
    if (adminExists)
      return res.status(400).json({ message: "Email déjà utilisé" });

    // ✅ Conversion explicite de la date
    adminData.date_naissance_client = new Date(adminData.date_naissance_client);

    const hashedPassword = await bcrypt.hash(adminData.mot_de_passe, 10);
    const newAdmin = await prisma.client.create({
      data: {
        provider: provider_enum.local,
        ...adminData,
        mot_de_passe: hashedPassword,
        statut_compte: "actif",
        id_role: 1,
      },
    });

    await sendMail({
      to: adminData.adresse_mail_client,
      subject: "🎉 Bienvenue sur UrbanHeritage",
      html: templateBienvenueCompte(
        adminData.prenom_client || adminData.nom_client
      ),
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error("/register-admin", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Récupération du client connecté ****************************************/
authRouter.get("/me", monMiddlewareBearer, async (req, res) => {
  const id_client = req.decoded?.id_client;
  if (!id_client) return res.status(401).json({ message: "Non autorisé" });

  try {
    const client = await prisma.client.findUnique({
      where: { id_client },
    });
    if (!client) return res.status(404).json({ message: "Client non trouvé" });

    res.json(client);
  } catch (error) {
    console.error("/me", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});