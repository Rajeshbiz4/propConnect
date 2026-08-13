import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  agencyName: { type: String, required: true, trim: true, maxlength: 150 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  whatsapp: { type: String, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['agent', 'admin'], default: 'agent' },
  city: { type: String, trim: true },
  officeAddress: { type: String, trim: true },
  serviceAreas: [{ type: String, trim: true }],
  aboutAgency: { type: String, trim: true, maxlength: 1500 },
  reraNumber: { type: String, trim: true },
  profileImage: { type: String, trim: true },
  agencyLogo: { type: String, trim: true },
  publicSlug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false }
}, { timestamps: true });

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.checkPassword = async function checkPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

export default mongoose.model('User', userSchema);
