
import multer from 'multer'
import { uploadMaillotToCloudinary } from '../config/cloudinary'



export const uploadImages = multer({ storage: uploadMaillotToCloudinary })
