import express from 'express';
import User from '../models/User.js';
import { slugify } from '../utils/slug.js';
import { signToken, createResetToken, hashResetToken } from '../utils/token.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

async function uniqueSlug(base) {
  const root = slugify(base) || `agent-${Date.now()}`;
  let candidate = root;
  let i = 1;
  while (await User.exists({ publicSlug: candidate })) candidate = `${root}-${i++}`;
  return candidate;
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, agencyName, email, mobile, whatsapp, password, city, officeAddress } = req.body;
    if (!name || !agencyName || !email || !mobile || !password) {
      return res.status(400).json({ message: 'Name, agency name, email, mobile and password are required' });
    }
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email is already registered' });

    const publicSlug = await uniqueSlug(agencyName);
    const user = new User({ name, agencyName, email, mobile, whatsapp: whatsapp || mobile, city, officeAddress, publicSlug });
    await user.setPassword(password);
    await user.save();
    res.status(201).json({ token: signToken(user), user: user.toSafeObject() });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+passwordHash');
    if (!user || !(await user.checkPassword(password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.status === 'blocked') return res.status(403).json({ message: 'Account is blocked' });
    res.json({ token: signToken(user), user: user.toSafeObject() });
  } catch (error) { next(error); }
});

router.get('/me', protect, (req, res) => res.json({ user: req.user.toSafeObject() }));

router.post('/forgot-password', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() }).select('+resetPasswordToken +resetPasswordExpires');
    let devResetToken;
    if (user) {
      const { raw, hash } = createResetToken();
      user.resetPasswordToken = hash;
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      if (process.env.DEV_RETURN_RESET_TOKEN === 'true') devResetToken = raw;
      console.log(`Password reset token for ${user.email}: ${raw}`);
    }
    res.json({ message: 'If the account exists, a reset link has been generated.', ...(devResetToken ? { devResetToken } : {}) });
  } catch (error) { next(error); }
});

router.post('/reset-password/:token', async (req, res, next) => {
  try {
    if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const tokenHash = hashResetToken(req.params.token);
    const user = await User.findOne({ resetPasswordToken: tokenHash, resetPasswordExpires: { $gt: new Date() } }).select('+resetPasswordToken +resetPasswordExpires +passwordHash');
    if (!user) return res.status(400).json({ message: 'Reset token is invalid or expired' });
    await user.setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) { next(error); }
});

export default router;
