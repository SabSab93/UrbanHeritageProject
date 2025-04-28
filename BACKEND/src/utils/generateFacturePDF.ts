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

export const generateFacturePDF = async (facture: Facture): Promise<string> =>
  new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '../../Factures');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const pdfPath = path.join(dir, `facture_${facture.numeroFacture}.pdf`);
    const doc     = new PDFDocument({ size: 'A4', margin: 50 });
    const stream  = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    /* -------------------------------------------------- */
    /*                     EN-TÊTE                        */
    /* -------------------------------------------------- */
    doc.fontSize(20).text('Facture UrbanHeritage', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Facture n° : ${facture.numeroFacture}`);
    doc.text(`Date       : ${facture.dateFacture}`);

    /* -------------------------------------------------- */
    /*                INFOS CLIENT                        */
    /* -------------------------------------------------- */
    doc.moveDown();
    doc.text(`Client  : ${facture.client.nom}`);
    doc.text(`Adresse : ${facture.client.adresse}`);
    doc.text(`Email   : ${facture.client.email}`);

    /* -------------------------------------------------- */
    /*                    ARTICLES                        */
    /* -------------------------------------------------- */
    doc.moveDown().text('Articles :');
    facture.articles.forEach((art, i) => {
      doc.moveDown(0.5);
      doc.text(`${i + 1}. ${art.description}`);
      doc.text(`    Prix de base          : ${art.prixDeBase.toFixed(2)} € HT`);
      if (art.totalPersonnalisations > 0)
        doc.text(`    Total personnalisations : ${art.totalPersonnalisations.toFixed(2)} € HT`);
      doc.text(`    Prix unitaire final   : ${art.prixUnitaireHT.toFixed(2)} € HT`);
      doc.text(`    Quantité              : ${art.quantite}`);
      doc.text(`    Total HT ligne        : ${art.montantHT.toFixed(2)} €`);

      art.personnalisations?.forEach(p =>
        doc.text(`        + Perso : ${p.description} (${p.prix.toFixed(2)} € HT)`)
      );
    });

    /* -------------------------------------------------- */
    /*                    LIVRAISON                       */
    /* -------------------------------------------------- */
    doc.moveDown().text('Livraison :');
    if (facture.livraison.methode)  doc.text(`Méthode : ${facture.livraison.methode}`);
    if (facture.livraison.lieu)     doc.text(`Lieu    : ${facture.livraison.lieu}`);
    if (facture.livraison.livreur)  doc.text(`Livreur : ${facture.livraison.livreur}`);
    if (facture.livraison.prix != null)
      doc.text(`Frais   : ${facture.livraison.prix.toFixed(2)} €`);

    /* -------------------------------------------------- */
    /*                      TOTAUX                        */
    /* -------------------------------------------------- */
    doc.moveDown().text('Totaux :');
    doc.text(`Sous-total HT (avant remise) : ${facture.totalHTBrut.toFixed(2)} €`);

    if (facture.reductionCommande && facture.reductionCommande > 0)
      doc.text(`Remise globale              : -${facture.reductionCommande.toFixed(2)} €`);

    doc.text(`Total HT (après remise)     : ${facture.totalHT.toFixed(2)} €`);
    doc.text(`TVA (${facture.tva} %)                : ${(facture.totalHT * facture.tva / 100).toFixed(2)} €`);
    doc.text(`Total TTC                   : ${facture.totalTTC.toFixed(2)} €`, { underline: true });

    doc.end();
    stream.on('finish', () => resolve(pdfPath));
    stream.on('error',   reject);
  });
