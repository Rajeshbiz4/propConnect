import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tenantName: { type: String, required: true, trim: true, maxlength: 100 },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  message: { type: String, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['new', 'contacted', 'visit-scheduled', 'interested', 'not-interested', 'closed'], default: 'new', index: true }
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);
