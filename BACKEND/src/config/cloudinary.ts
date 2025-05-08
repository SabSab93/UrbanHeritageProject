import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import type { Request } from 'express';
type MulterFile = Express.Multer.File;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: MulterFile) => {
    const extension = file.mimetype.split('/')[1]; 
    return {
      folder:    'urbanheritage/maillots',
      format:    extension,              // 'jpeg' | 'png'…
      public_id: `maillot_${Date.now()}`,
    };
  }
});

