import mongoose from 'mongoose';
import { getMongoUri } from '@/lib/db/config';

// Define the global cache object shape
declare global {
  var mongooseConnection: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Initialize the cache
let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && cached.conn.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const uri = getMongoUri();

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        dbName: process.env.MONGO_DATABASE_NAME || 'pulse_db',
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        maxIdleTimeMS: 60000,
      })
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}
