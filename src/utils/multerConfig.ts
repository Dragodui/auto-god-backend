// src/utils/multerConfig.ts
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { ensureUploadsDir } from './ensureUploadsDir';

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const uploadsDir = ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload;
