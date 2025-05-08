import multer from 'multer';
import { uploadToCloudinary } from '../src/config/cloudinary';

export const uploadImages = multer({ storage: uploadToCloudinary });
