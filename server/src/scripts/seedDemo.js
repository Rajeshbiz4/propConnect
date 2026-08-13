import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Property from '../models/Property.js';

await connectDB();
let agent = await User.findOne({ email: 'demo@saiproperties.com' }).select('+passwordHash');
if (!agent) {
  agent = new User({ name: 'Ajay Patil', agencyName: 'Sai Properties', email: 'demo@saiproperties.com', mobile: '9876543210', whatsapp: '9876543210', city: 'Pune', officeAddress: 'Wakad, Pune', publicSlug: 'sai-properties', serviceAreas: ['Wakad', 'Hinjewadi', 'Baner'], aboutAgency: 'Rental and resale properties across West Pune.' });
  await agent.setPassword('Demo@12345');
  await agent.save();
}

if (!(await Property.exists({ agent: agent._id }))) {
  await Property.insertMany([
    {
      agent: agent._id, propertyCode: 'PROP-DEMO-001', title: '2 BHK Flat for Rent in Wakad', description: 'Spacious semi-furnished flat with parking and lift.', purpose: 'rent', propertyType: 'flat', bhk: '2BHK', carpetArea: 850, monthlyRent: 22000, deposit: 60000, maintenance: 2500, furnishing: 'semi-furnished', preferredTenant: 'family', address: { state: 'Maharashtra', city: 'Pune', area: 'Wakad', societyName: 'Green Avenue', landmark: 'Near Datta Mandir Road' }, amenities: ['Lift','Car Parking','Security','CCTV','Water Supply'], status: 'vacant', isPublished: true
    },
    {
      agent: agent._id, propertyCode: 'PROP-DEMO-002', title: 'Commercial Plot in Hinjewadi', description: 'Road-touch plot suitable for commercial development.', purpose: 'sale', propertyType: 'plot', carpetArea: 3000, areaUnit: 'sqft', sellingPrice: 8500000, roadTouch: true, roadWidth: 30, plotUsage: 'commercial', address: { state: 'Maharashtra', city: 'Pune', area: 'Hinjewadi', landmark: 'Near Phase 1' }, amenities: [], status: 'available', isPublished: true
    }
  ]);
}
console.log('Demo agent: demo@saiproperties.com / Demo@12345');
console.log('Public page: http://localhost:5173/agent/sai-properties');
process.exit(0);
