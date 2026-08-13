import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { slugify } from '../utils/slug.js';

const router = express.Router();
router.use(protect);

router.put('/', async (req, res, next) => {
  try {
    const allowed = ['name', 'agencyName', 'mobile', 'whatsapp', 'city', 'officeAddress', 'serviceAreas', 'aboutAgency', 'reraNumber'];
    for (const key of allowed) if (req.body[key] !== undefined) req.user[key] = req.body[key];
    if (req.body.publicSlug !== undefined) {
      const publicSlug = slugify(req.body.publicSlug);
      if (!publicSlug) return res.status(400).json({ message: 'Public URL name is invalid' });
      const taken = await User.exists({ publicSlug, _id: { $ne: req.user._id } });
      if (taken) return res.status(409).json({ message: 'That public URL is already in use' });
      req.user.publicSlug = publicSlug;
    }
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (error) { next(error); }
});

router.put('/change-password', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!(await user.checkPassword(req.body.currentPassword || ''))) return res.status(400).json({ message: 'Current password is incorrect' });
    if (!req.body.newPassword || req.body.newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
    await user.setPassword(req.body.newPassword);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) { next(error); }
});

export default router;
