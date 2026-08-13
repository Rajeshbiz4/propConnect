import express from 'express';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, requireRole('admin'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const [agents, activeAgents, properties, enquiries] = await Promise.all([
      User.countDocuments({ role: 'agent' }),
      User.countDocuments({ role: 'agent', status: 'active' }),
      Property.countDocuments(),
      Enquiry.countDocuments()
    ]);
    res.json({ agents, activeAgents, properties, enquiries });
  } catch (error) { next(error); }
});

router.get('/agents', async (req, res, next) => {
  try {
    const items = await User.find({ role: 'agent' }).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) { next(error); }
});

router.put('/agents/:id/status', async (req, res, next) => {
  try {
    const agent = await User.findOneAndUpdate({ _id: req.params.id, role: 'agent' }, { status: req.body.status }, { new: true, runValidators: true });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ agent });
  } catch (error) { next(error); }
});

router.get('/properties', async (req, res, next) => {
  try {
    const items = await Property.find().populate('agent', 'name agencyName email publicSlug status').sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) { next(error); }
});

export default router;
