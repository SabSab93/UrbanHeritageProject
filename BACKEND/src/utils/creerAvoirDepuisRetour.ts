import { PrismaClient } from "@prisma/client";
import { generateAvoirPDF } from "./generateAvoirPDF";
import { sendMailWithAttachment } from "./mailService";
import { templateAvoirCreation } from "../templateMails/avoir/avoirCreation";

const prisma = new PrismaClient();

export const creerAvoirDepuisRetour = async (id_commande_retour: number) => {
  const retour = await prisma.retour.findUnique({
    where: { id_commande_retour },
    include: {
      Commande: { include: { Client: true } },
      RetourLigneCommande: { include: { LigneCommande: { include: { Maillot: true } } } },
    },
  });

  if (!retour || !retour.Commande) {
    throw new Error("Retour ou commande introuvable.");
  }

  const numeroAvoir = `AVR-${id_commande_retour}-${Date.now()}`;

  const avoir = await prisma.avoir.create({
    data: {
      numero_avoir: numeroAvoir,
      date_avoir: new Date(),
      avoir_hors_ue: retour.Commande.Client.pays_client.toLowerCase() === "suisse",
    },
  });

  const avoirPDFData = {
    numeroAvoir,
    dateAvoir: new Date().toLocaleDateString("fr-FR"),
    client: {
      nom: retour.Commande.Client.nom_client,
      adresse: retour.Commande.Client.adresse_client,
      email: retour.Commande.Client.adresse_mail_client,
    },
    articles: retour.RetourLigneCommande.map((r) => ({
      description: r.LigneCommande.Maillot.nom_maillot,
      quantite: r.LigneCommande.quantite,
      prixUnitaireHT: r.LigneCommande.prix_ht.toNumber(),
      montantHT: r.LigneCommande.quantite * r.LigneCommande.prix_ht.toNumber(),
    })),
    totalHT: retour.RetourLigneCommande.reduce((acc, r) => acc + r.LigneCommande.quantite * r.LigneCommande.prix_ht.toNumber(), 0),
    tva: retour.Commande.Client.pays_client.toLowerCase() === "suisse" ? 0 : 20,
    totalTTC: retour.RetourLigneCommande.reduce((acc, r) => acc + r.LigneCommande.quantite * r.LigneCommande.prix_ht.toNumber(), 0) * (retour.Commande.Client.pays_client.toLowerCase() === "suisse" ? 1 : 1.2),
  };

  const pathPDF = await generateAvoirPDF(avoirPDFData);

  await sendMailWithAttachment({
    to: retour.Commande.Client.adresse_mail_client,
    subject: "💸 Votre avoir UrbanHeritage est disponible",
    html: templateAvoirCreation(retour.Commande.Client.prenom_client || retour.Commande.Client.nom_client, numeroAvoir),
    attachmentPath: pathPDF,
  });

  return avoir;
};
