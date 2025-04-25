import { Router } from "express";
import { sendMail, sendMailWithAttachment } from "../utils/mailService";
import path from "path";

export const testMailRouter = Router();

// ✅ Route pour tester l'envoi de mail depuis UrbanHeritage
testMailRouter.get("/send", async (req, res) => {
  try {
    await sendMail({
      to: "urbanheritage.project.mds@gmail.com", 
      subject: "💌 Test UrbanHeritage - Fonctionnement OK",
      text: `Hello Sabrina !

Ceci est un test d'envoi de mail depuis ton serveur UrbanHeritage 🚀.`,
    });

    res.status(200).json({ message: "✅ Mail envoyé avec succès à urbanheritage.project.mds@gmail.com !" });
  } catch (err: any) {
    console.error("Erreur envoi mail :", err);
    res.status(500).json({ message: " Erreur lors de l'envoi du mail", erreur: err.message });
  }
});

// ✅ Route pour tester l'envoi d'une facture en pièce jointe
testMailRouter.get("/send-facture", async (req, res) => {
  try {
    const numeroFacture = "FCT-2-1745564935283";
    const attachmentPath = path.join(__dirname, `../../Factures/facture_${numeroFacture}.pdf`);

    await sendMailWithAttachment({
      to: "urbanheritage.project.mds@gmail.com", 
      subject: "Votre Facture UrbanHeritage",
      text: `Bonjour,

Veuillez trouver ci-joint votre facture UrbanHeritage.

Merci pour votre confiance et à très bientôt 💙`,
      attachmentPath,
    });

    res.status(200).json({ message: "Facture envoyée par email avec succès 🎉" });
  } catch (err: any) {
    console.error("Erreur envoi mail avec pièce jointe :", err);
    res.status(500).json({ message: "Erreur lors de l'envoi du mail", erreur: err.message });
  }
});