import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase, memoryStore } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'animebom-default-jwt-secret-key-change-in-production';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields (name, email, password) are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    const dbConnected = await connectToDatabase();

    let createdUser;

    if (dbConnected) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 409 }
        );
      }

      createdUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      });
    } else {
      // In-memory fallback if MONGODB_URI is not configured yet
      const existingUser = memoryStore.findUserByEmail(normalizedEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 409 }
        );
      }

      createdUser = memoryStore.createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      });
    }

    const token = jwt.sign(
      {
        userId: createdUser._id.toString(),
        email: createdUser.email,
        name: createdUser.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: createdUser._id.toString(),
      name: createdUser.name,
      email: createdUser.email,
      user_metadata: { name: createdUser.name },
      favorites: createdUser.favorites || [],
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: safeUser,
      token,
    });

    // Set HTTP-only cookie for secure persistence
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}
