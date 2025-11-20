import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse CLOUDINARY_URL manually to ensure proper configuration
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
  console.error('CLOUDINARY_URL:', cloudinaryUrl);
  console.error('All env vars:', process.env);
  throw new Error('CLOUDINARY_URL environment variable is not set!');
}

// Parse the URL: cloudinary://api_key:api_secret@cloud_name
const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
if (!match) {
  throw new Error('Invalid CLOUDINARY_URL format');
}

const [, api_key, api_secret, cloud_name] = match;

// Configure Cloudinary explicitly
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

console.log('Cloudinary configured with cloud_name:', cloud_name);

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'hisab-kitab/profile-photos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'limit' }],
      public_id: `user-${req.user._id}-${Date.now()}`,
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { cloudinary, upload };
