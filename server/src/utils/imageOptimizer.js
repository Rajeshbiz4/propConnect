import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || 'uploads');
const propertyDir = path.join(uploadRoot, 'properties');
const thumbnailDir = path.join(uploadRoot, 'thumbnails');

const maxWidth = Number(process.env.IMAGE_MAX_WIDTH || 1600);
const maxHeight = Number(process.env.IMAGE_MAX_HEIGHT || 1200);
const webpQuality = Number(process.env.IMAGE_WEBP_QUALITY || 82);
const thumbWidth = Number(process.env.THUMB_WIDTH || 500);
const thumbHeight = Number(process.env.THUMB_HEIGHT || 375);
const thumbQuality = Number(process.env.THUMB_WEBP_QUALITY || 75);

function uniqueBaseName() {
  return `property-${Date.now()}-${crypto.randomBytes(7).toString('hex')}`;
}

export async function ensureImageDirectories() {
  await Promise.all([
    fs.mkdir(propertyDir, { recursive: true }),
    fs.mkdir(thumbnailDir, { recursive: true })
  ]);
}

export async function optimizePropertyImage(inputPath, originalName = '') {
  await ensureImageDirectories();

  // Read metadata first. This verifies that the uploaded file is actually a
  // decodable image, rather than trusting only the browser-supplied MIME type.
  let metadata;
  try {
    metadata = await sharp(inputPath, { failOn: 'error' }).metadata();
  } catch {
    const error = new Error('The uploaded file is not a valid or supported image');
    error.status = 400;
    throw error;
  }
  if (!metadata.width || !metadata.height || !metadata.format) {
    const error = new Error('The uploaded file is not a valid image');
    error.status = 400;
    throw error;
  }

  const base = uniqueBaseName();
  const filename = `${base}.webp`;
  const thumbnailFilename = `${base}-thumb.webp`;
  const outputPath = path.join(propertyDir, filename);
  const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

  let mainInfo;
  try {
    mainInfo = await sharp(inputPath, { failOn: 'error' })
      .rotate()
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: webpQuality, effort: 4 })
      .toFile(outputPath);

    await sharp(inputPath, { failOn: 'error' })
      .rotate()
      .resize({
        width: thumbWidth,
        height: thumbHeight,
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: true
      })
      .webp({ quality: thumbQuality, effort: 4 })
      .toFile(thumbnailPath);
  } catch (error) {
    await Promise.allSettled([
      fs.unlink(outputPath),
      fs.unlink(thumbnailPath)
    ]);
    throw error;
  }

  return {
    filename,
    thumbnailFilename,
    originalName,
    width: mainInfo.width,
    height: mainInfo.height,
    sizeBytes: mainInfo.size
  };
}

export async function removeOptimizedImageFiles(image) {
  const paths = [];
  if (image?.filename) {
    const isOptimized = Boolean(image.thumbnailFilename) || String(image.url || '').includes('/uploads/properties/');
    paths.push(path.join(isOptimized ? propertyDir : uploadRoot, image.filename));
  }
  if (image?.thumbnailFilename) paths.push(path.join(thumbnailDir, image.thumbnailFilename));
  await Promise.allSettled(paths.map(filePath => fs.unlink(filePath)));
}

export async function removeTempUpload(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // Temp cleanup should never make a successful request fail.
  }
}
