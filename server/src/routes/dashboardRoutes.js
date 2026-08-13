import express from 'express';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, requireRole('agent', 'admin'));

router.get('/', async (req, res, next) => {
  try {
    const ownerFilter = req.user.role === 'admin' ? {} : { agent: req.user._id };
    const [total, vacant, rented, available, sold, enquiryCount, recent] = await Promise.all([
      Property.countDocuments(ownerFilter),
      Property.countDocuments({ ...ownerFilter, status: 'vacant' }),
      Property.countDocuments({ ...ownerFilter, status: 'rented' }),
      Property.countDocuments({ ...ownerFilter, status: 'available' }),
      Property.countDocuments({ ...ownerFilter, status: 'sold' }),
      Enquiry.countDocuments(req.user.role === 'admin' ? {} : { agent: req.user._id }),
      Property.find(ownerFilter).sort({ createdAt: -1 }).limit(5).lean()
    ]);
    res.json({ total, vacant, rented, available, sold, enquiries: enquiryCount, recent });
  } catch (error) { next(error); }
});

export default router;
