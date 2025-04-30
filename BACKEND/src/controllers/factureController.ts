import { Request, Response } from 'express';
import { generateFacturePDF } from '../utils/generateFacturePDF';

export const createFacturePDF = async (req: Request, res: Response) => {
  try {
    const factureData = req.body; 

    const pdfPath = await generateFacturePDF(factureData);

    res.status(200).json({
      message: 'PDF généré avec succès.',
      path: pdfPath,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du PDF', error });
  }
};
