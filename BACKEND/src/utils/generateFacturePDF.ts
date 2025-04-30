import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface Facture {
  numeroFacture: string;
  dateFacture: string;
  client: {
    nom: string;
    adresse: string;
    email: string;
  };
  articles: {
    description: string;
    quantite: number;
    prixDeBase: number;
    totalPersonnalisations: number;
    prixUnitaireHT: number;
    montantHT: number;
    personnalisations?: {
      description: string;
      prix: number;
    }[];
  }[];
  // ----- nouveaux champs -----
  totalHTBrut: number;         // avant remise
  reductionCommande?: number;  // remise globale éventuelle
  // ---------------------------
  totalHT: number;             // après remise
  tva: number;
  totalTTC: number;
  livraison: {
    methode?: string;
    lieu?: string;
    livreur?: string;
    prix?: number;
  };
}

export const generateFacturePDF = (fact: Facture): Promise<string> =>
  new Promise((resolve, reject) => {
    const dir = path.join(__dirname, "../../Factures");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const pdfPath = path.join(dir, `facture_${fact.numeroFacture}.pdf`);
    const doc     = new PDFDocument({ size: "A4", margin: 50 });
    const stream  = fs.createWriteStream(pdfPath);

    doc.on("error", reject);
    stream.on("error", reject);
    stream.on("close", () => resolve(pdfPath));

    doc.pipe(stream);

    /* -------------------------------------------------- */
    /*                     EN-TÊTE                        */
    /* -------------------------------------------------- */
    doc.fontSize(20).text("Facture UrbanHeritage", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Facture n° : ${fact.numeroFacture}`);
    doc.text(`Date       : ${fact.dateFacture}`);

    /* -------------------------------------------------- */
    /*                INFOS CLIENT                        */
    /* -------------------------------------------------- */
    doc.moveDown();
    doc.text(`Client  : ${fact.client.nom}`);
    doc.text(`Adresse : ${fact.client.adresse}`);
    doc.text(`Email   : ${fact.client.email}`);

    /* -------------------------------------------------- */
    /*                    ARTICLES                        */
    /* -------------------------------------------------- */
    doc.moveDown().text("Articles :");
    fact.articles.forEach((a, i) => {
      doc.moveDown(0.5);
      doc.text(`${i + 1}. ${a.description}`);
      doc.text(`    Prix de base          : ${a.prixDeBase.toFixed(2)} € HT`);
      if (a.totalPersonnalisations > 0) {
        doc.text(
          `    Total personnalisations : ${a.totalPersonnalisations.toFixed(
            2
          )} € HT`
        );
      }
      doc.text(
        `    Prix unitaire final   : ${a.prixUnitaireHT.toFixed(2)} € HT`
      );
      doc.text(`    Quantité              : ${a.quantite}`);
      doc.text(`    Total HT ligne        : ${a.montantHT.toFixed(2)} €`);

      a.personnalisations?.forEach((p) =>
        doc.text(
          `        + Perso : ${p.description} (${p.prix.toFixed(2)} € HT)`
        )
      );
    });

    /* -------------------------------------------------- */
    /*                    LIVRAISON                       */
    /* -------------------------------------------------- */
    doc.moveDown().text("Livraison :");
    if (fact.livraison.methode) doc.text(`Méthode : ${fact.livraison.methode}`);
    if (fact.livraison.lieu) doc.text(`Lieu    : ${fact.livraison.lieu}`);
    if (fact.livraison.livreur) doc.text(`Livreur : ${fact.livraison.livreur}`);
    if (fact.livraison.prix != null)
      doc.text(`Frais   : ${fact.livraison.prix.toFixed(2)} €`);

    /* -------------------------------------------------- */
    /*                      TOTAUX                        */
    /* -------------------------------------------------- */
    doc.moveDown().text("Totaux :");
    doc.text(
      `Sous-total HT (avant remise) : ${fact.totalHTBrut.toFixed(2)} €`
    );
    if (fact.reductionCommande && fact.reductionCommande > 0)
      doc.text(
        `Remise globale              : -${fact.reductionCommande.toFixed(2)} €`
      );

    doc.text(
      `Total HT (après remise)     : ${fact.totalHT.toFixed(2)} €`
    );
    doc.text(
      `TVA (${fact.tva} %)                : ${(
        fact.totalHT * fact.tva / 100
      ).toFixed(2)} €`
    );
    doc.text(
      `Total TTC                   : ${fact.totalTTC.toFixed(2)} €`,
      { underline: true }
    );

    /* -------- FIN DU DOCUMENT ------------------------------------------- */
    doc.end();
  });