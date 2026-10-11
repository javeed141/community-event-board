import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDb();
    const body = await request.json();
    const { email, password } = body;

    // Check required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      role: 'user',
      favoriteCategories: [],
    });

    // Create JWT token
    const token = signToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        message: 'Signup successful',
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          favoriteCategories: newUser.favoriteCategories || [],
        },
      },
      { status: 201 }
    );

    // Save token in cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
