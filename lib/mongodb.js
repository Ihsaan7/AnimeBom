import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function invocations in production (Vercel).
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.warn('[MongoDB] MONGODB_URI is not set in environment variables. Falling back to local in-memory store.');
    return null;
  }

  if (!cached.promise) {
    // Fail fast on disconnects instead of hanging requests in serverless environments
    mongoose.set('bufferCommands', false);

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('[MongoDB] Connected successfully');
      return mongooseInstance;
    }).catch((err) => {
      console.error('[MongoDB] Connection error:', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

// In-memory mock storage fallback when MONGODB_URI is not set or DB is offline
const inMemoryUsers = new Map();

export const memoryStore = {
  findUserByEmail: (email) => {
    return inMemoryUsers.get(email.toLowerCase().trim()) || null;
  },
  findUserById: (id) => {
    for (const user of inMemoryUsers.values()) {
      if (user.id === id || user._id === id) return user;
    }
    return null;
  },
  createUser: (userData) => {
    const id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const user = {
      _id: id,
      id,
      ...userData,
      email: userData.email.toLowerCase().trim(),
      favorites: userData.favorites || [],
      watchlist: userData.watchlist || [],
      createdAt: new Date(),
    };
    inMemoryUsers.set(user.email, user);
    return user;
  }
};
