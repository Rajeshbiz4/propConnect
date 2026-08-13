import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  filename: { type: String, required: true },
  thumbnailFilename: { type: String, default: '' },
  originalName: { type: String, default: '' },
  width: { type: Number, min: 1 },
  height: { type: Number, min: 1 },
  sizeBytes: { type: Number, min: 0 },
  isCover: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { _id: true });

const propertySchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  propertyCode: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 4000 },
  purpose: { type: String, enum: ['rent', 'sale'], required: true, index: true },
  propertyType: {
    type: String,
    enum: ['flat', 'house', 'bungalow', 'plot', 'shop', 'office', 'commercial', 'warehouse', 'pg', 'other'],
    required: true,
    index: true
  },
  bhk: { type: String, enum: ['', '1RK', '1BHK', '2BHK', '3BHK', '4BHK', '4+BHK'], default: '' },
  carpetArea: { type: Number, min: 0 },
  builtUpArea: { type: Number, min: 0 },
  areaUnit: { type: String, enum: ['sqft', 'sqm', 'acre', 'guntha'], default: 'sqft' },
  floor: { type: Number },
  totalFloors: { type: Number, min: 0 },
  propertyAge: { type: Number, min: 0 },
  furnishing: { type: String, enum: ['', 'unfurnished', 'semi-furnished', 'fully-furnished'], default: '' },
  preferredTenant: { type: String, enum: ['', 'family', 'bachelor', 'female-bachelor', 'male-bachelor', 'company', 'anyone'], default: '' },
  plotLength: { type: Number, min: 0 },
  plotWidth: { type: Number, min: 0 },
  roadTouch: { type: Boolean, default: false },
  roadWidth: { type: Number, min: 0 },
  cornerPlot: { type: Boolean, default: false },
  plotUsage: { type: String, enum: ['', 'residential', 'commercial'], default: '' },
  naPlot: { type: Boolean, default: false },
  boundaryWall: { type: Boolean, default: false },
  monthlyRent: { type: Number, min: 0 },
  deposit: { type: Number, min: 0 },
  maintenance: { type: Number, min: 0, default: 0 },
  maintenanceIncluded: { type: Boolean, default: false },
  brokerage: { type: Number, min: 0, default: 0 },
  sellingPrice: { type: Number, min: 0 },
  negotiable: { type: Boolean, default: false },
  loanAvailable: { type: Boolean, default: false },
  availableFrom: { type: Date },
  minimumAgreementMonths: { type: Number, min: 0 },
  noticePeriodMonths: { type: Number, min: 0 },
  address: {
    state: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    area: { type: String, trim: true, index: true },
    societyName: { type: String, trim: true },
    landmark: { type: String, trim: true },
    pinCode: { type: String, trim: true },
    fullAddress: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  amenities: [{ type: String, trim: true }],
  images: [imageSchema],
  status: { type: String, enum: ['vacant', 'rented', 'available', 'sold', 'temporarily-unavailable', 'archived'], index: true },
  isPublished: { type: Boolean, default: true, index: true },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

propertySchema.index({ agent: 1, status: 1, createdAt: -1 });
propertySchema.index({ 'address.city': 1, 'address.area': 1, purpose: 1, propertyType: 1 });

export default mongoose.model('Property', propertySchema);
