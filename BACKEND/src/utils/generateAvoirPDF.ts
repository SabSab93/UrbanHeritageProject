// src/utils/generateAvoirPDF.ts

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface Avoir {
  numeroAvoir: string;
  dateAvoir: string;
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
  }[];
  totalHT: number;
  tva: number;
  totalTTC: number;
}

export const generateAvoirPDF = async (avoir: Avoir): Promise<string> => {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '../../Avoirs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pdfPath = path.join(dir, `avoir_${avoir.numeroAvoir}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // Titre
    doc.fontSize(20).text('Avoir UrbanHeritage', { align: 'center' });

    // Infos de base
    doc.moveDown();
    doc.fontSize(12).text(`Avoir numéro : ${avoir.numeroAvoir}`);
    doc.text(`Date : ${avoir.dateAvoir}`);

    // Infos client
    doc.moveDown();
    doc.text(`Client : ${avoir.client.nom}`);
    doc.text(`Adresse : ${avoir.client.adresse}`);
    doc.text(`Email : ${avoir.client.email}`);

    // Articles
    doc.moveDown().text('Articles remboursés :');
    avoir.articles.forEach((art, i) => {
      const prixInit   = art.prixUnitaireHT.toFixed(2);
      const montantHT  = art.montantHT.toFixed(2);
    
      doc.text(`${i + 1}. ${art.description}`);
      doc.text(`    Prix initial HT     : ${prixInit} €`);
      doc.text(`    Quantité            : ${art.quantite}`);
      doc.text(`    Montant remboursé HT: ${montantHT} €`);
    });

    // Totaux
    doc.moveDown();
    doc.text(`Total HT remboursé      : ${avoir.totalHT.toFixed(2)} €`);
    doc.text(`TVA (${avoir.tva} %)    : ${(avoir.totalHT * avoir.tva / 100).toFixed(2)} €`);
    doc.text(`Total TTC remboursé     : ${avoir.totalTTC.toFixed(2)} €`, { underline: true });
    

    doc.end();

    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', reject);
  });
};
