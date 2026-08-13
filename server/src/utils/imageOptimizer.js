import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import os from 'os';

const uploadRoot = process.env.VERCEL
  ? path.join(os.tmpdir(), 'propconnect-uploads')
  : path.resolve(process.env.UPLOAD_DIR || 'uploads');
const propertyDir = path.join(uploadRoot, 'properties');
const thumbnailDir = path.join(uploadRoot, 'thumbnails');

const maxWidth = Number(process.env.IMAGE_MAX_WIDTH || 1600);
const maxHeight = Number(process.env.IMAGE_MAX_HEIGHT || 1200);
const configuredQuality = Number(process.env.IMAGE_WEBP_QUALITY || 82);
const maxFinalBytes = Number(process.env.MAX_FINAL_IMAGE_MB || 5) * 1024 * 1024;
const thumbWidth = Number(process.env.THUMB_WIDTH || 500);
const thumbHeight = Number(process.env.THUMB_HEIGHT || 375);
const thumbQuality = Number(process.env.THUMB_WEBP_QUALITY || 75);

function uniqueBaseName() {
  return `property-${Date.now()}-${crypto.randomBytes(7).toString('hex')}`;
}

function uniqueDescending(values) {
  return [...new Set(values.map(value => Math.max(20, Math.min(100, Math.round(value)))))]
    .sort((a, b) => b - a);
}

const qualitySteps = uniqueDescending([
  configuredQuality,
  78,
  72,
  66,
  60,
  54,
  48,
  42,
  36
]);

const sizeScales = [1, 0.9, 0.8, 0.7, 0.6, 0.5];

export async function ensureImageDirectories() {
  await Promise.all([
    fs.mkdir(propertyDir, { recursive: true }),
    fs.mkdir(thumbnailDir, { recursive: true })
  ]);
}

async function buildMainImage(inputPath) {
  // First try the preferred quality. If the result is still over 5 MB,
  // progressively reduce WebP quality and, only if needed, dimensions.
  for (const scale of sizeScales) {
    const targetWidth = Math.max(320, Math.round(maxWidth * scale));
    const targetHeight = Math.max(240, Math.round(maxHeight * scale));

    for (const quality of qualitySteps) {
      const { data, info } = await sharp(inputPath, { failOn: 'error' })
        .rotate()
        .resize({
          width: targetWidth,
          height: targetHeight,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality, effort: 4, smartSubsample: true })
        .toBuffer({ resolveWithObject: true });

      if (info.size <= maxFinalBytes) {
        return { data, info, quality };
      }
    }
  }

  const error = new Error(
    `Image could not be optimized below ${Number(process.env.MAX_FINAL_IMAGE_MB || 5)} MB`
  );
  error.status = 400;
  throw error;
}

export async function optimizePropertyImage(inputPath, originalName = '') {
  await ensureImageDirectories();

  // Do not trust the browser MIME type. Sharp must be able to decode the
  // uploaded file before it is accepted as an image.
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

  try {
    const main = await buildMainImage(inputPath);
    await fs.writeFile(outputPath, main.data);

    await sharp(inputPath, { failOn: 'error' })
      .rotate()
      .resize({
        width: thumbWidth,
        height: thumbHeight,
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: true
      })
      .webp({ quality: thumbQuality, effort: 4, smartSubsample: true })
      .toFile(thumbnailPath);

    return {
      filename,
      thumbnailFilename,
      originalName,
      width: main.info.width,
      height: main.info.height,
      sizeBytes: main.info.size,
      quality: main.quality
    };
  } catch (error) {
    await Promise.allSettled([
      fs.unlink(outputPath),
      fs.unlink(thumbnailPath)
    ]);
    throw error;
  }
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
