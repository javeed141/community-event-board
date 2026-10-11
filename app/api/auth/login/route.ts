import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/User';
import { verifyPassword, signToken } from '@/lib/auth';

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

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if password matches
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        favoriteCategories: user.favoriteCategories || [],
      },
    });

    // Save token in cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
