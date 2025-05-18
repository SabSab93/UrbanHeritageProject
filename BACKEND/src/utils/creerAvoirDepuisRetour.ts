// src/utils/creerAvoirDepuisRetour.ts
import { PrismaClient } from "@prisma/client";
import { generateAvoirPDF }  from "./generateAvoirPDF";
import { sendMailWithAttachment } from "./mailService";
import { templateAvoirCreation }   from "../templateMails/avoir/avoirCreation";

const prisma = new PrismaClient();

export const creerAvoirDepuisRetour = async (id_commande_retour: number) => {
  /* 1️⃣  Charger le retour + commande + lignes */
  const retour = await prisma.retour.findUnique({
    where: { id_commande_retour },
    include: {
      Commande: {
        include: {
          Client           : true,
          CommandeReduction: { include: { Reduction: true } },
          LigneCommande    : { include: { Maillot: true, Personnalisation: true } },
        },
      },
      RetourLigneCommande: {
        include: {
          LigneCommande: {
            include: { Maillot: true, Personnalisation: true },
          },
        },
      },
    },
  });

  if (!retour || !retour.Commande) {
    throw new Error("Retour ou commande introuvable.");
  }

  /* 2️⃣  Infos de la remise globale */
  const remiseGlobale = retour.Commande.CommandeReduction?.Reduction;
  const valeurRemise  = remiseGlobale ? remiseGlobale.valeur_reduction.toNumber() : 0;

  /* 3️⃣  Total HT brut de la commande (avant remise) */
const totalHTBrutCommande = retour.Commande.LigneCommande.reduce((acc, l) => {
  const prixBase  = l.prix_ht.toNumber();
  const prixPerso = l.Personnalisation
    ? l.Personnalisation.prix_ht.toNumber()
    : 0;
  return acc + (prixBase + prixPerso) * l.quantite;
}, 0);

/* 4️⃣  Construire les lignes remboursées */
const lignesAvoir = retour.RetourLigneCommande.map((r) => {
  const l              = r.LigneCommande;
  const prixBase       = l.prix_ht.toNumber();
  const prixPerso      = l.Personnalisation
    ? l.Personnalisation.prix_ht.toNumber()
    : 0;
  const montantLigneHT = (prixBase + prixPerso) * l.quantite;

  // prorata de la remise globale sur cette ligne
  const partRemise     = valeurRemise > 0
    ? (montantLigneHT / totalHTBrutCommande) * valeurRemise
    : 0;

  const montantRembourseHT = montantLigneHT - partRemise;

  return {
    description      : l.Maillot.nom_maillot,
    quantite         : l.quantite,
    prixUnitaireHT   : prixBase + prixPerso,
    montantHT        : montantRembourseHT,
  };
});

  /* 5️⃣  Totaux de l’avoir */
  const totalHT  = lignesAvoir.reduce((sum, line) => sum + line.montantHT, 0);
  const horsUE   = retour.Commande.Client.pays_client.toLowerCase() === "suisse";
  const tvaRate  = horsUE ? 0 : 20;
  const totalTTC = totalHT * (1 + tvaRate / 100);

  /* 6️⃣  Créer l’avoir en base */
  const numeroAvoir = `AVR-${id_commande_retour}-${Date.now()}`;
  const avoir = await prisma.avoir.create({
    data: {
      numero_avoir       : numeroAvoir,
      date_avoir         : new Date(),
      avoir_hors_ue      : horsUE,
      id_commande_retour : id_commande_retour,
    },
  });

  /* 7️⃣  Génération du PDF */
  const pdfData = {
    numeroAvoir : numeroAvoir,
    dateAvoir   : new Date().toLocaleDateString("fr-FR"),
    client      : {
      nom     : retour.Commande.Client.nom_client,
      adresse : retour.Commande.Client.adresse_client,
      email   : retour.Commande.Client.adresse_mail_client,
    },
    articles   : lignesAvoir,
    totalHT,
    tva: tvaRate,
    totalTTC,
  };

  const pdfPath = await generateAvoirPDF(pdfData);

  /* 8️⃣  Mail au client */
  await sendMailWithAttachment({
    to             : retour.Commande.Client.adresse_mail_client,
    subject        : "💸 Votre avoir UrbanHeritage",
    html           : templateAvoirCreation(
                        retour.Commande.Client.prenom_client
                        || retour.Commande.Client.nom_client,
                        numeroAvoir
                    ),
    attachmentPath : pdfPath,
  });

  return avoir;
};
