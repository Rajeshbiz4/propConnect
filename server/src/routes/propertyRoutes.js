import express from 'express';
import Property from '../models/Property.js';
import { protect, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { optimizePropertyImage, removeOptimizedImageFiles, removeTempUpload } from '../utils/imageOptimizer.js';

const router = express.Router();
router.use(protect, requireRole('agent', 'admin'));

function ownerFilter(user) {
  return user.role === 'admin' ? {} : { agent: user._id };
}

function propertyPayload(body) {
  const keys = [
    'title','description','purpose','propertyType','bhk','carpetArea','builtUpArea','areaUnit','floor','totalFloors','propertyAge','furnishing','preferredTenant',
    'plotLength','plotWidth','roadTouch','roadWidth','cornerPlot','plotUsage','naPlot','boundaryWall','monthlyRent','deposit','maintenance','maintenanceIncluded',
    'brokerage','sellingPrice','negotiable','loanAvailable','availableFrom','minimumAgreementMonths','noticePeriodMonths','address','amenities','status','isPublished'
  ];
  const payload = {};
  for (const key of keys) if (body[key] !== undefined) payload[key] = body[key];
  return payload;
}

function defaultStatus(purpose) { return purpose === 'sale' ? 'available' : 'vacant'; }
function code() { return `PROP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`; }

router.get('/', async (req, res, next) => {
  try {
    const q = { ...ownerFilter(req.user) };
    if (req.query.status) q.status = req.query.status;
    if (req.query.purpose) q.purpose = req.query.purpose;
    if (req.query.propertyType) q.propertyType = req.query.propertyType;
    const items = await Property.find(q).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = propertyPayload(req.body);
    if (!payload.title || !payload.purpose || !payload.propertyType) return res.status(400).json({ message: 'Title, purpose and property type are required' });
    if (!payload.status) payload.status = defaultStatus(payload.purpose);
    const property = await Property.create({ ...payload, agent: req.user._id, propertyCode: code() });
    res.status(201).json({ property });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, ...ownerFilter(req.user) }).lean();
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ property });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, ...ownerFilter(req.user) },
      { $set: propertyPayload(req.body) },
      { new: true, runValidators: true }
    );
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ property });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, ...ownerFilter(req.user) });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    property.status = 'archived';
    property.isPublished = false;
    await property.save();
    res.json({ message: 'Property archived' });
  } catch (error) { next(error); }
});

router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const original = await Property.findOne({ _id: req.params.id, ...ownerFilter(req.user) }).lean();
    if (!original) return res.status(404).json({ message: 'Property not found' });
    delete original._id; delete original.__v; delete original.createdAt; delete original.updatedAt;
    original.propertyCode = code();
    original.title = `${original.title} (Copy)`;
    original.images = [];
    const copy = await Property.create(original);
    res.status(201).json({ property: copy });
  } catch (error) { next(error); }
});

router.post('/:id/images', upload.array('images', 20), async (req, res, next) => {
  const tempFiles = req.files || [];
  const createdImages = [];

  try {
    const property = await Property.findOne({ _id: req.params.id, ...ownerFilter(req.user) });
    if (!property) {
      await Promise.all(tempFiles.map(file => removeTempUpload(file.path)));
      return res.status(404).json({ message: 'Property not found' });
    }

    const remainingSlots = Math.max(0, 20 - property.images.length);
    if (tempFiles.length > remainingSlots) {
      await Promise.all(tempFiles.map(file => removeTempUpload(file.path)));
      return res.status(400).json({
        message: `A property can have maximum 20 photos. You can upload ${remainingSlots} more.`
      });
    }

    const baseUrl = String(process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const startOrder = property.images.length;

    for (let index = 0; index < tempFiles.length; index += 1) {
      const file = tempFiles[index];
      try {
        const optimized = await optimizePropertyImage(file.path, file.originalname);
        const image = {
          url: `${baseUrl}/uploads/properties/${optimized.filename}`,
          thumbnailUrl: `${baseUrl}/uploads/thumbnails/${optimized.thumbnailFilename}`,
          filename: optimized.filename,
          thumbnailFilename: optimized.thumbnailFilename,
          originalName: optimized.originalName,
          width: optimized.width,
          height: optimized.height,
          sizeBytes: optimized.sizeBytes,
          isCover: property.images.length === 0 && index === 0,
          order: startOrder + index
        };
        createdImages.push(image);
      } finally {
        await removeTempUpload(file.path);
      }
    }

    property.images.push(...createdImages);
    await property.save();
    res.status(201).json({ images: property.images });
  } catch (error) {
    await Promise.all(tempFiles.map(file => removeTempUpload(file.path)));
    await Promise.all(createdImages.map(image => removeOptimizedImageFiles(image)));
    next(error);
  }
});

router.delete('/:id/images/:imageId', async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, ...ownerFilter(req.user) });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const image = property.images.id(req.params.imageId);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const imageFiles = {
      filename: image.filename,
      thumbnailFilename: image.thumbnailFilename,
      url: image.url
    };
    const wasCover = image.isCover;
    property.images.pull(req.params.imageId);
    if (wasCover && property.images[0]) property.images[0].isCover = true;
    await property.save();
    await removeOptimizedImageFiles(imageFiles);

    res.json({ images: property.images });
  } catch (error) { next(error); }
});

router.put('/:id/images/:imageId/cover', async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, ...ownerFilter(req.user) });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const image = property.images.id(req.params.imageId);
    if (!image) return res.status(404).json({ message: 'Image not found' });
    property.images.forEach((img) => { img.isCover = img._id.toString() === req.params.imageId; });
    await property.save();
    res.json({ images: property.images });
  } catch (error) { next(error); }
});

export default router;
