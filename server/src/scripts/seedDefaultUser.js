import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import databaseConfig from '../config/databaseConfig.js';

export async function seedDefaultUser() {
  const config = databaseConfig.defaultUser;
  const email = config.email.toLowerCase();

  const existingUser = await User.exists({ email });
  if (existingUser) {
    return { created: false, email };
  }

  const passwordHash = await bcrypt.hash(config.password, 12);

  try {
    await User.create({
      name: config.name,
      agencyName: config.agencyName,
      email,
      mobile: config.mobile,
      whatsapp: config.whatsapp,
      passwordHash,
      role: config.role,
      publicSlug: config.publicSlug,
      status: config.status
    });

    console.log(`Default user created: ${email}`);
    return { created: true, email };
  } catch (error) {
    // Multiple Vercel instances can start at the same time. If another
    // instance created the seed user first, the unique email/slug index can
    // raise E11000. In that case the desired seed state already exists.
    if (error?.code === 11000) {
      return { created: false, email };
    }
    throw error;
  }
}
