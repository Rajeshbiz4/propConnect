import express from 'express';
import Enquiry from '../models/Enquiry.js';
import Property from '../models/Property.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/public', async (req, res, next) => {
  try {
    const { propertyId, tenantName, mobile, email, message } = req.body;
    if (!propertyId || !tenantName || !mobile) return res.status(400).json({ message: 'Property, name and mobile are required' });
    const property = await Property.findOne({ _id: propertyId, isPublished: true, status: { $nin: ['archived', 'temporarily-unavailable'] } });
    if (!property) return res.status(404).json({ message: 'Property is not available' });
    const enquiry = await Enquiry.create({ property: property._id, agent: property.agent, tenantName, mobile, email, message });
    res.status(201).json({ message: 'Enquiry sent successfully', enquiryId: enquiry._id });
  } catch (error) { next(error); }
});

router.use(protect, requireRole('agent', 'admin'));

router.get('/', async (req, res, next) => {
  try {
    const q = req.user.role === 'admin' ? {} : { agent: req.user._id };
    if (req.query.status) q.status = req.query.status;
    const items = await Enquiry.find(q).populate('property', 'title propertyCode address monthlyRent sellingPrice purpose').sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) { next(error); }
});

router.put('/:id/status', async (req, res, next) => {
  try {
    const q = { _id: req.params.id, ...(req.user.role === 'admin' ? {} : { agent: req.user._id }) };
    const item = await Enquiry.findOneAndUpdate(q, { status: req.body.status }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Enquiry not found' });
    res.json({ enquiry: item });
  } catch (error) { next(error); }
});

export default router;
