import { connectDB } from '../config/db.js';
import databaseConfig from '../config/databaseConfig.js';

try {
  await connectDB();
  console.log(`Admin ready: ${databaseConfig.defaultUser.email}`);
  process.exit(0);
} catch (error) {
  console.error('Admin seed failed:', error);
  process.exit(1);
}
