import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendMailWithAttachment } from "../utils/mailService";
import { templateFactureEnvoyee } from "../templateMails/commande/envoiFacture";

const prisma = new PrismaClient();

export const downloadFacture = async (req: Request, res: Response) => {
    const num        = req.params.numero_facture;
    const wantFile   =
         req.query.file === "true"
      || req.headers.accept?.includes("application/pdf");
  
    const filePath = path.join(__dirname, `../../Factures/facture_${num}.pdf`);
  
    /* 1. vérifie l’existence du fichier */
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "PDF introuvable 😕" });
    }
  
    /* 2. récupère l’email du client pour l’envoi par mail */
    const facture = await prisma.facture.findUnique({
      where  : { numero_facture: num },
      include: { Commande: { include: { Client: true } } },
    });
  
    const emailClient = facture?.Commande?.Client?.adresse_mail_client;
  
    /* 3. mail en arrière-plan */
    if (emailClient) {
      sendMailWithAttachment({
        to           : emailClient,
        subject      : "🧾 Votre facture UrbanHeritage",
        html         : templateFactureEnvoyee(
                        facture.Commande!.Client.prenom_client
                     ?? facture.Commande!.Client.nom_client
                      ),
        attachmentPath: filePath,
      }).catch(err => console.error("[MAIL-FACTURE]", err));
    }
  
    /* 4. réponse HTTP */
    if (wantFile) {
      // — mode « fichier » : on délivre le PDF
      return res.download(filePath, (err) => {
        if (err) {
          res.status(500).json({
            message: "Erreur lors du téléchargement",
            erreur : err.message,
          });
        }
      });
    }
  
    // — mode « JSON » : message lisible seulement
    return res.json({
      message: "Votre facture a été envoyée par e-mail 📧  — bon match !",
      numero : num,
    });
  };