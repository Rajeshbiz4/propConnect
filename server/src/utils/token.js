import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import appConfig from '../config/appConfig.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    appConfig.jwtSecret,
    { expiresIn: appConfig.jwtExpiresIn }
  );
}

export function createResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export function hashResetToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
