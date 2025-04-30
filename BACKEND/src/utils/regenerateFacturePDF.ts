import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { generateFacturePDF } from "./generateFacturePDF";

const prisma = new PrismaClient();

/**
 * Regénère (et ré-écrase) le PDF d’une facture existante.
 * @param numeroFacture   ex. « FCT-5-1746036001807 »
 * @returns le chemin absolu du nouveau PDF
 * @throws 404 si la facture n’existe pas
 */
export const regenerateFacturePDF = async (numeroFacture: string): Promise<string> => {
  /* 1. Charge la facture complète -------------------------------------- */
  const facture = await prisma.facture.findUnique({
    where: { numero_facture: numeroFacture },
    include: {
      Commande: {
        include: {
          Client: true,
          LigneCommande: {
            include: {
              Maillot: true,
              LigneCommandePersonnalisation: {
                include: { Personnalisation: true }
              }
            }
          },
          Livraison: {
            include: {
              MethodeLivraison: true,
              LieuLivraison: true,
              Livreur: true
            }
          },
          CommandeReduction: { include: { Reduction: true } }
        }
      }
    }
  });

  if (!facture) {
    throw new Error("404");          // route traitera l’erreur
  }

  /* 2. Re-construit les données PDF ------------------------------------ */
  const cmd = facture.Commande!;
  const clt = cmd.Client;
  const liv = cmd.Livraison[0];

  const articles = cmd.LigneCommande.map((l) => {
    const prixBase = l.prix_ht.toNumber();
    const prixPersoTot = l.LigneCommandePersonnalisation
      .reduce((s, p) => s + p.prix_personnalisation_ht.toNumber(), 0);
    const prixUnitaire = prixBase + prixPersoTot;
    const montantHT = prixUnitaire * l.quantite;

    return {
      description           : l.Maillot.nom_maillot,
      quantite              : l.quantite,
      prixDeBase            : prixBase,
      totalPersonnalisations: prixPersoTot,
      prixUnitaireHT        : prixUnitaire,
      montantHT,
      personnalisations     : l.LigneCommandePersonnalisation.map(p => ({
        description: p.Personnalisation.type_personnalisation,
        prix       : p.prix_personnalisation_ht.toNumber()
      }))
    };
  });

  const prixLivraison = (liv?.MethodeLivraison.prix_methode || 0) +
                        (liv?.LieuLivraison.prix_lieu || 0);
  const totalArticlesHT = articles.reduce((s, a) => s + a.montantHT, 0);
  const reduc = cmd.CommandeReduction?.Reduction?.valeur_reduction.toNumber() || 0;

  const totalHTBrut = totalArticlesHT + prixLivraison;
  const totalHT = totalHTBrut - reduc;
  const tvaRate = facture.facture_hors_ue ? 0 : 20;
  const totalTTC = totalHT * (1 + tvaRate / 100);

  const pdfData = {
    numeroFacture: facture.numero_facture,
    dateFacture  : facture.date_facture
                     ? facture.date_facture.toLocaleDateString("fr-FR")
                     : "Date non disponible",
    client: {
      nom    : clt.nom_client,
      adresse: clt.adresse_client,
      email  : clt.adresse_mail_client
    },
    articles,
    totalHTBrut,
    reductionCommande: reduc,
    totalHT,
    tva : tvaRate,
    totalTTC,
    livraison: {
      methode: liv?.MethodeLivraison.nom_methode,
      lieu   : liv?.LieuLivraison.nom_lieu,
      livreur: liv?.Livreur.nom_livreur,
      prix   : prixLivraison
    }
  };

  /* 3. Efface l’ancien fichier ----------------------------------------- */
  const filePath = path.join(__dirname, `../../Factures/facture_${numeroFacture}.pdf`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  /* 4. Génère le nouveau PDF ------------------------------------------- */
  await generateFacturePDF(pdfData);
  return filePath;
};
