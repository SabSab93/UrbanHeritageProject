import { Router } from "express";
import { sendMail } from "../utils/mailService";

export const testMailRouter = Router();

// ✅ Route pour tester l'envoi de mail depuis UrbanHeritage
testMailRouter.get("/send", async (req, res) => {
  try {
    await sendMail({
      to: "urbanheritage.project.mds@gmail.com", // 👉 Envoi vers ta nouvelle adresse pro
      subject: "💌 Test UrbanHeritage - Fonctionnement OK",
      text: `Hello Sabrina !

Ceci est un test d'envoi de mail depuis ton serveur UrbanHeritage 🚀.`,
    });

    res.status(200).json({ message: "✅ Mail envoyé avec succès à urbanheritage.project.mds@gmail.com !" });
  } catch (err: any) {
    console.error("Erreur envoi mail :", err);
    res.status(500).json({ message: "❌ Erreur lors de l'envoi du mail", erreur: err.message });
  }
});
