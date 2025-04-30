import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendMailWithAttachment } from "../utils/mailService";
import { templateFactureEnvoyee } from "../templateMails/commande/envoiFacture";

const prisma = new PrismaClient();

export const downloadFacture = async (req: Request, res: Response) => {
  const num = req.params.numero_facture;
  const wantJson = req.query.json === "true";          // ← nouveau flag
  const filePath = path.join(__dirname, `../../Factures/facture_${num}.pdf`);

  /* 1. fichier présent ? */
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "PDF introuvable" });
  }

  /* 2. email client (pour l’envoi) */
  const facture = await prisma.facture.findUnique({
    where: { numero_facture: num },
    include: { Commande: { include: { Client: true } } },
  });
  const emailClient = facture?.Commande?.Client?.adresse_mail_client;

  /* 3. mail en arrière-plan */
  if (emailClient) {
    sendMailWithAttachment({
      to: emailClient,
      subject: "🧾 Votre facture UrbanHeritage",
      html: templateFactureEnvoyee(
        facture.Commande!.Client.prenom_client ||
          facture.Commande!.Client.nom_client
      ),
      attachmentPath: filePath,
    }).catch((err) =>
      console.error("Erreur d’envoi de la facture par e-mail :", err)
    );
  }

  if (wantJson) {
    return res.json({
      message: "Votre facture vient d'être envoyée par email 📧",
    });
  }

  res.download(filePath, (err) => {
    if (err) {
      res
        .status(500)
        .json({ message: "Erreur lors du téléchargement", erreur: err.message });
    }
  });
};
