import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase, memoryStore } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'animebom-default-jwt-secret-key-change-in-production';

export async function GET(req) {
  try {
    let token = req.cookies.get('auth_token')?.value;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ user: null });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ user: null });
    }

    const dbConnected = await connectToDatabase();
    let user;

    if (dbConnected) {
      user = await User.findById(decoded.userId).select('-password');
    } else {
      user = memoryStore.findUserById(decoded.userId);
    }

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        user_metadata: { name: user.name },
        favorites: user.favorites || [],
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ user: null });
  }
}
