import mongoose from 'mongoose';
import databaseConfig from './databaseConfig.js';
import { seedDefaultUser } from '../scripts/seedDefaultUser.js';

let connectionPromise = null;
let defaultUserSeedPromise = null;

async function ensureDefaultUser() {
  if (!defaultUserSeedPromise) {
    defaultUserSeedPromise = seedDefaultUser().catch((error) => {
      defaultUserSeedPromise = null;
      throw error;
    });
  }

  return defaultUserSeedPromise;
}

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    await ensureDefaultUser();
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(databaseConfig.uri, {
      dbName: databaseConfig.databaseName,
      ...databaseConfig.options
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
  await ensureDefaultUser();

  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  return mongoose.connection;
}
