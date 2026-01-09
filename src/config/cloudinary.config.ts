
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import config from './index';

cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret,
});

// Use memory storage - file is stored in memory as Buffer
const storage = multer.memoryStorage();

export const upload = multer({ storage: storage });
export const cloudinaryInstance = cloudinary;
