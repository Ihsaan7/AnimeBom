import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase, memoryStore } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'animebom-default-jwt-secret-key-change-in-production';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbConnected = await connectToDatabase();

    let user;

    if (dbConnected) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryStore.findUserByEmail(normalizedEmail);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      user_metadata: { name: user.name },
      favorites: user.favorites || [],
    };

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: safeUser,
      token,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign in.' },
      { status: 500 }
    );
  }
}
