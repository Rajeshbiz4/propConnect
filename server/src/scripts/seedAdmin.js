import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

await connectDB();
const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
let user = await User.findOne({ email }).select('+passwordHash');
if (!user) {
  user = new User({ name: 'System Admin', agencyName: 'Platform Admin', email, mobile: '9999999999', whatsapp: '9999999999', role: 'admin', publicSlug: `admin-${Date.now()}` });
}
user.role = 'admin';
user.status = 'active';
await user.setPassword(process.env.ADMIN_PASSWORD || 'Admin@12345');
await user.save();
console.log(`Admin ready: ${email}`);
process.exit(0);
