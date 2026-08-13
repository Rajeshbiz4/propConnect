import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Property from '../models/Property.js';

const router = express.Router();

router.get('/agents/:slug', async (req, res, next) => {
  try {
    const agent = await User.findOne({ publicSlug: req.params.slug.toLowerCase(), role: 'agent', status: 'active' }).lean();
    if (!agent) return res.status(404).json({ message: 'Agent page not found' });
    delete agent.passwordHash;
    res.json({ agent });
  } catch (error) { next(error); }
});

router.get('/agents/:slug/properties', async (req, res, next) => {
  try {
    const agent = await User.findOne({ publicSlug: req.params.slug.toLowerCase(), role: 'agent', status: 'active' }).select('_id publicSlug');
    if (!agent) return res.status(404).json({ message: 'Agent page not found' });
    const q = { agent: agent._id, isPublished: true, status: { $nin: ['archived', 'temporarily-unavailable'] } };
    if (req.query.purpose) q.purpose = req.query.purpose;
    if (req.query.propertyType) q.propertyType = req.query.propertyType;
    if (req.query.bhk) q.bhk = req.query.bhk;
    if (req.query.city) q['address.city'] = new RegExp(req.query.city, 'i');
    if (req.query.area) q['address.area'] = new RegExp(req.query.area, 'i');
    if (req.query.minPrice || req.query.maxPrice) {
      const priceField = req.query.purpose === 'sale' ? 'sellingPrice' : 'monthlyRent';
      q[priceField] = {};
      if (req.query.minPrice) q[priceField].$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) q[priceField].$lte = Number(req.query.maxPrice);
    }
    const items = await Property.find(q).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) { next(error); }
});

router.get('/agents/:slug/properties/:id', async (req, res, next) => {
  try {
    const agent = await User.findOne({ publicSlug: req.params.slug.toLowerCase(), role: 'agent', status: 'active' }).select('_id name agencyName mobile whatsapp publicSlug city officeAddress serviceAreas aboutAgency reraNumber');
    if (!agent) return res.status(404).json({ message: 'Agent page not found' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Property not found' });
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, agent: agent._id, isPublished: true, status: { $nin: ['archived', 'temporarily-unavailable'] } },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ property, agent });
  } catch (error) { next(error); }
});

export default router;
