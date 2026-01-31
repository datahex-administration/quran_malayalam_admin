import { NextRequest, NextResponse } from 'next/server';
import { createToken, validateLoginCode } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { loginCode } = await request.json();

    if (!loginCode) {
      return NextResponse.json(
        { error: 'Login code is required' },
        { status: 400 }
      );
    }

    // Validate the login code against environment variables
    const { valid, role } = validateLoginCode(loginCode);

    if (!valid || !role) {
      return NextResponse.json(
        { error: 'Invalid login code' },
        { status: 401 }
      );
    }

    // Connect to database and track login
    await connectDB();

    // Find or create user record
    let user = await User.findOne({ loginCode });
    
    if (!user) {
      user = await User.create({
        loginCode,
        role,
        lastLogin: new Date(),
        loginCount: 1,
      });
    } else {
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();
    }

    // Create JWT token
    const token = await createToken({ loginCode, role });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      role,
      message: 'Login successful',
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
