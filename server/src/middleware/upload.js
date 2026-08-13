import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';

const uploadRoot = process.env.VERCEL
  ? path.join(os.tmpdir(), 'propconnect-uploads')
  : path.resolve(process.env.UPLOAD_DIR || 'uploads');
const tempDir = path.join(uploadRoot, '.tmp');
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    // This is only a safety limit for the SOURCE upload. The image saved by
    // the application is optimized separately to MAX_FINAL_IMAGE_MB (5 MB).
    fileSize: Number(process.env.MAX_SOURCE_IMAGE_MB || 50) * 1024 * 1024,
    files: 20
  }
  // No MIME-only filter here. Browser MIME values are not reliable and some
  // phone formats can be reported differently. Sharp validates the actual
  // file contents before the image is saved.
});
