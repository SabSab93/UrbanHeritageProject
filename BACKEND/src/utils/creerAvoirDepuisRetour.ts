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
          Client          : true,
          CommandeReduction: { include: { Reduction: true } },
          LigneCommande   : { include: { LigneCommandePersonnalisation: true } },
        },
      },
      RetourLigneCommande: {
        include: {
          LigneCommande: {
            include: { Maillot: true, LigneCommandePersonnalisation: true },
          },
        },
      },
    },
  });

  if (!retour || !retour.Commande) {
    throw new Error("Retour ou commande introuvable.");
  }

  /* 2️⃣  Infos de la remise globale (si existe) */
  const remiseGlobale = retour.Commande.CommandeReduction?.Reduction;
  const valeurRemise  = remiseGlobale ? remiseGlobale.valeur_reduction.toNumber() : 0;

  /* 3️⃣  Total HT brut de la commande (avant remise) */
  const totalHTBrutCommande = retour.Commande.LigneCommande.reduce((acc, l) => {
    const prixBase = Number(l.prix_ht);
    const totalPerso = l.LigneCommandePersonnalisation
        .reduce((a, p) => a + Number(p.prix_personnalisation_ht), 0);
    return acc + (prixBase + totalPerso) * l.quantite;
  }, 0);

  /* 4️⃣  Construire les lignes remboursées avec prorata remise */
  const lignesAvoir = retour.RetourLigneCommande.map((r) => {
    const l          = r.LigneCommande;
    const prixBase   = Number(l.prix_ht);
    const totalPerso = l.LigneCommandePersonnalisation
        .reduce((a, p) => a + Number(p.prix_personnalisation_ht), 0);

    const montantHTLigne = (prixBase + totalPerso) * l.quantite;

    // prorata de la remise globale sur cette ligne
    const partRemise     = valeurRemise > 0
        ? (montantHTLigne / totalHTBrutCommande) * valeurRemise
        : 0;

    const montantRembourseHT = montantHTLigne - partRemise;

    return {
      description      : l.Maillot.nom_maillot,
      quantite         : l.quantite,
      prixUnitaireHT   : prixBase + totalPerso,  // sans remise
      montantHT        : montantRembourseHT,     // après remise
    };
  });

  /* 5️⃣  Totaux de l’avoir */
  const totalHT = lignesAvoir.reduce((a, line) => a + line.montantHT, 0);
  const horsUE  = retour.Commande.Client.pays_client.toLowerCase() === "suisse";
  const tva     = horsUE ? 0 : 20;
  const totalTTC= totalHT * (1 + tva / 100);

  /* 6️⃣  Créer l’avoir en base */
  const numeroAvoir = `AVR-${id_commande_retour}-${Date.now()}`;
  const avoir = await prisma.avoir.create({
    data: {
      numero_avoir       : numeroAvoir,
      date_avoir         : new Date(),
      avoir_hors_ue      : horsUE,
      id_commande_retour : id_commande_retour,   //  ✅ champ obligatoire
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
    tva,
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
                      numeroAvoir),
    attachmentPath : pdfPath,
  });

  return avoir;
};
