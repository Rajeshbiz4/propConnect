import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || 'uploads');
const tempDir = path.join(uploadRoot, '.tmp');
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024,
    files: 20
  },
  fileFilter: (req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(new Error('Only JPG, PNG and WEBP images are allowed'));
    }
    cb(null, true);
  }
});
