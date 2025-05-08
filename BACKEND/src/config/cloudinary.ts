// src/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import type { Request } from 'express';
type MulterFile = Express.Multer.File;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Storage pour les images de maillots, sous /urbanheritage/maillots
 */
export const uploadMaillotToCloudinary = new CloudinaryStorage({
  cloudinary,
  params: async (_req: Request, file: MulterFile) => {
    const ext = file.mimetype.split('/')[1];
    return {
      folder:    'urbanheritage/maillots',
      format:    ext,
      public_id: `maillot_${Date.now()}`,
    };
  },
});

/**
 * Storage pour les images d’artistes, sous /urbanheritage/artistes
 */
export const uploadArtisteToCloudinary = new CloudinaryStorage({
  cloudinary,
  params: async (_req: Request, file: MulterFile) => {
    const ext = file.mimetype.split('/')[1];
    return {
      folder:    'urbanheritage/artistes',
      format:    ext,
      public_id: `artiste_${Date.now()}`,
    };
  },
});
