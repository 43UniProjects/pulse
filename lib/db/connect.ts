import mongoose from 'mongoose';
import { getMongoUri } from './config';

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
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getMongoUri();
    console.log('Connecting to MongoDB with URI:', uri);

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
