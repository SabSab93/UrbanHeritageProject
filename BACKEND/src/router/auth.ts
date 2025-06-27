
import { Router, Request, Response } from "express";
import { PrismaClient, provider_enum } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import { monMiddlewareBearer } from "../middleware/checkToken";
import { isAdmin } from "../middleware/isAdmin";
import { sendMail } from "../utils/mailService";
import { templateActivationCompte } from "../templateMails/compte/activationCompte";
import { templateBienvenueCompte } from "../templateMails/compte/bienvenueCompte";
import { templateForgotPassword } from "../templateMails/compte/resetMotDePasse";
import { findOrCreateUser } from "../utils/findOrCreateUser";
import { xssGuardMiddleware } from "../middleware/xssGuard";


export const authRouter = Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/*** Utils *******************************************************************/
/** Génère un JWT valable 24 h pour le client donné. */
const generateJwt = (idClient: number, idRole: number | null) =>
  jwt.sign({ id_client: idClient, id_role: idRole }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });

  const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

  const loginLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,               // 5 requêtes max par minute par IP
  message: { message: "Trop de tentatives, réessayez dans un instant." },
});


/*** Inscription locale (client) *******************************************/
authRouter.post('/register-client',xssGuardMiddleware, async (req, res) => {
  const {
    nom_client,
    prenom_client,
    civilite,
    date_naissance_client,
    adresse_client,
    code_postal_client,
    ville_client,
    pays_client,
    adresse_mail_client,
    mot_de_passe
  } = req.body;

  try {
    const existing = await prisma.client.findUnique({
      where: { adresse_mail_client }
    });
    if (existing) {
      if (existing.activation_token) {
        const newActivationToken = crypto.randomBytes(32).toString('hex');
        await prisma.client.update({
          where: { id_client: existing.id_client },
          data: { activation_token: newActivationToken }
        });
        await sendMail({
          to: existing.adresse_mail_client,
          subject: '🔔 Rappel : active ton compte UrbanHeritage',
          html: templateActivationCompte(
            existing.prenom_client || existing.nom_client,
            newActivationToken
          ).html,
          text: templateActivationCompte(
            existing.prenom_client || existing.nom_client,
            newActivationToken
          ).text
        });
        return res.status(200).json({
          message:
            "Vérifie ton email pour activer ton compte."
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600 * 1000); // 1 h de validité

      await prisma.client.update({
        where: { id_client: existing.id_client },
        data: {
          reset_token: resetToken,
          reset_token_expiry: expiry
        }
      });
      await sendMail({
        to: existing.adresse_mail_client,
        subject: '🔑 Réinitialisation de ton mot de passe UrbanHeritage',
        html: templateForgotPassword(
          existing.prenom_client || existing.nom_client,
          resetToken
        ),
        text: `Pour réinitialiser ton mot de passe, clique ici : ${(process
          .env.FRONTEND_URL || 'http://localhost:4200'
        ).replace(/\/$/, '')}/reset-password?token=${resetToken}`
      });
      return res.status(200).json({
        message:
          "Vérifie ton email pour activer ton compte."
      });
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(mot_de_passe, salt);

    const activationToken = crypto.randomBytes(32).toString('hex');
    const newClient = await prisma.client.create({
      data: {
        nom_client,
        prenom_client,
        civilite,
        date_naissance_client: new Date(date_naissance_client),
        adresse_client,
        code_postal_client,
        ville_client,
        pays_client,
        adresse_mail_client,
        mot_de_passe: hash,
        activation_token: activationToken,
        statut_compte: 'en_attente',
        id_role: 2 
      }
    });


    await sendMail({
      to: newClient.adresse_mail_client,
      subject: '👋 Bienvenue chez UrbanHeritage ! Active ton compte',
      html: templateActivationCompte(
        newClient.prenom_client || newClient.nom_client,
        activationToken
      ).html,
      text: templateActivationCompte(
        newClient.prenom_client || newClient.nom_client,
        activationToken
      ).text
    });

    return res.status(201).json({
      message: 'Vérifie ton email pour activer ton compte.'
    });
  } catch (error) {
    console.error('[REGISTER] erreur', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
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

      }
    });
  } catch (error) {
    console.error("/activate", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/*** Connexion locale ******************************************************/
authRouter.post("/login",loginLimiter, xssGuardMiddleware, async (req: Request, res: Response) => {
  const { email, mot_de_passe: password } = req.body;
  try {
    const client = await prisma.client.findUnique({
      where: { adresse_mail_client: email },
    });
    if (
      !client ||
      (client.provider === provider_enum.local && client.statut_compte !== "actif")
    ) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    const match = await bcrypt.compare(password, client.mot_de_passe!);
    if (!match) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    const token = generateJwt(client.id_client, client.id_role);
    return res.json({ token, client });
  } catch (error) {
    console.error("Erreur /login:", error);
    return res.status(500).json({ message: "Erreur serveur" });
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
authRouter.post("/forgot-password",xssGuardMiddleware, async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ message: "Email manquant" });
  }
  try {
    const client = await prisma.client.findUnique({
      where: { adresse_mail_client: email },
    });
    if (!client || client.provider !== provider_enum.local) {
      return res.status(404).json({ message: "Compte introuvable" });
    }
    // Génère un token et l’enregistre DANS reset_token
    const resetToken = crypto.randomBytes(30).toString("hex");
    const expiry = new Date(Date.now() + 3600 * 1000); // 1h
    await prisma.client.update({
      where: { id_client: client.id_client },
      data: {
        reset_token: resetToken,
        reset_token_expiry: expiry,
      },
    });

    // Envoi du mail de reset
    await sendMail({
      to: client.adresse_mail_client,
      subject: "🔑 Réinitialisation de votre mot de passe",
      html: templateForgotPassword(
        client.prenom_client || client.nom_client,
        resetToken
      ),
    });

    return res.json({ message: "Email de réinitialisation envoyé." });
  } catch (err) {
    console.error("/forgot-password", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

/*** Réinitialisation du mot de passe (via reset_token) ***********************/
authRouter.post("/reset-password",xssGuardMiddleware, async (req, res) => {
  const { token } = req.query as { token?: string };
  const { password } = req.body as { password?: string };
  if (!token) {
    return res.status(400).json({ message: "Token manquant" });
  }
  if (!password) {
    return res.status(400).json({ message: "Mot de passe manquant" });
  }
  try {
    const client = await prisma.client.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: { gt: new Date() },
        provider: provider_enum.local,
      },
    });
    if (!client) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }
    // Hash avec le même nombre de rounds
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.client.update({
      where: { id_client: client.id_client },
      data: {
        mot_de_passe: hash,
        reset_token: null,
        reset_token_expiry: null,
      },
    });
    return res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("/reset-password", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});


/*** Creation Admin *********************************************************/
authRouter.post("/register-admin", monMiddlewareBearer, isAdmin,xssGuardMiddleware, async (req, res) => {
  try {
    const adminData = req.body.data;
    if (!adminData)
      return res.status(400).json({ message: "Corps de requête manquant" });
    const adminExists = await prisma.client.findUnique({
      where: { adresse_mail_client: adminData.adresse_mail_client },
    });
    if (adminExists)
      return res.status(400).json({ message: "Email déjà utilisé" });

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


authRouter.post('/resend-activation', async (req, res) => {
  const { email } = req.body;
  const client = await prisma.client.findUnique({ where: { adresse_mail_client: email } });
  if (!client) return res.status(404).json({ message: "Aucun compte trouvé." });
  if (client.statut_compte === 'actif') {
    return res.status(400).json({ message: "Ce compte est déjà activé." });
  }
  const newToken = crypto.randomBytes(32).toString('hex');
  await prisma.client.update({
    where: { id_client: client.id_client },
    data: { activation_token: newToken }
  });
  await sendMail({
    to: client.adresse_mail_client,
    subject: "🔔 Nouveau lien d'activation UrbanHeritage",
    html: templateActivationCompte(client.prenom_client||client.nom_client, newToken).html,
    text: templateActivationCompte(client.prenom_client||client.nom_client, newToken).text
  });
  res.json({ message: "Un nouveau lien d'activation vient de t'être envoyé." });
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


/*** Changement de mot de passe pour le client authentifié ***/
authRouter.patch(
  "/change-password",
  monMiddlewareBearer,xssGuardMiddleware,
  async (req: Request, res: Response) => {
    const idClient = req.decoded?.id_client;
    if (!idClient) return res.status(401).json({ message: "Non autorisé" });

    const { oldPassword, newPassword } = req.body as {
      oldPassword?: string;
      newPassword?: string;
    };

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Ancien et nouveau mot de passe requis" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Le nouveau mot de passe doit faire au moins 8 caractères" });
    }

    try {
      const client = await prisma.client.findUnique({
        where: { id_client: idClient },
      });
      if (!client || !client.mot_de_passe) {
        return res.status(404).json({ message: "Client introuvable" });
      }

      const match = await bcrypt.compare(oldPassword, client.mot_de_passe);
      if (!match) {
        await new Promise((r) => setTimeout(r, 1000));
        return res.status(401).json({ message: "Ancien mot de passe incorrect" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.client.update({
        where: { id_client: idClient },
        data: { mot_de_passe: hashed },
      });

      return res.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      console.error("/change-password", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
);