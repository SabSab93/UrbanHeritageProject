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
    prixUnitaireHT: number;
    montantHT: number;
    personnalisations?: {
      description: string;
      prix: number;
    }[];
  }[];
  totalHT: number;
  tva: number;
  totalTTC: number;
  livraison: {
    methode?: string;
    lieu?: string;
    livreur?: string;
    prix?: number;
  };
}

export const generateFacturePDF = async (facture: Facture): Promise<string> => {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '../../Factures');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pdfPath = path.join(dir, `facture_${facture.numeroFacture}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // Titre
    doc.fontSize(20).text('Facture UrbanHeritage', { align: 'center' });

    // Infos de base
    doc.moveDown();
    doc.fontSize(12).text(`Facture numéro : ${facture.numeroFacture}`);
    doc.text(`Date : ${facture.dateFacture}`);

    // Infos client
    doc.moveDown();
    doc.text(`Client : ${facture.client.nom}`);
    doc.text(`Adresse : ${facture.client.adresse}`);
    doc.text(`Email : ${facture.client.email}`);

    // Articles
    doc.moveDown().text('Articles :');
    facture.articles.forEach((article, index) => {
      doc.text(`${index + 1}. ${article.description} - ${article.quantite} x ${article.prixUnitaireHT}€ HT = ${article.montantHT}€`);
      if (article.personnalisations && article.personnalisations.length > 0) {
        article.personnalisations.forEach(perso => {
          doc.text(`    + Personnalisation : ${perso.description} (${perso.prix.toFixed(2)}€ HT)`);
        });
      }
    });

    // Livraison
    doc.moveDown().text('Livraison :');
    if (facture.livraison.methode) doc.text(`Méthode : ${facture.livraison.methode}`);
    if (facture.livraison.lieu) doc.text(`Lieu : ${facture.livraison.lieu}`);
    if (facture.livraison.livreur) doc.text(`Livreur : ${facture.livraison.livreur}`);
    if (facture.livraison.prix != null) doc.text(`Frais livraison : ${facture.livraison.prix.toFixed(2)}€`);

    // Totaux
    doc.moveDown();
    doc.text(`Total HT : ${facture.totalHT.toFixed(2)}€`);
    doc.text(`TVA (${facture.tva}%) : ${(facture.totalHT * facture.tva / 100).toFixed(2)}€`);
    doc.text(`Total TTC : ${facture.totalTTC.toFixed(2)}€`, { underline: true });

    doc.end();

    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', reject);
  });
};
