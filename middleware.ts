import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isPublicPath) {
    // If user is already logged in and tries to access login page, redirect to dashboard
    if (token && request.nextUrl.pathname === '/login') {
      const user = await verifyToken(token);
      if (user) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    return NextResponse.next();
  }

  // Check if path is an admin route
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin') || 
                       request.nextUrl.pathname.startsWith('/api/');

  if (isAdminPath) {
    if (!token) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = await verifyToken(token);
    if (!user) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/login',
  ],
};
