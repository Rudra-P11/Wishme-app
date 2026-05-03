import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Public routes — always accessible
  const publicRoutes = ['/', '/login', '/api/auth'];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get session using auth()
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  // Protected routes — require authentication (allow guest browsing)
  if (!isLoggedIn && pathname.startsWith('/dashboard')) {
    const isGuest = req.nextUrl.searchParams.get('guest') === 'true';
    if (!isGuest) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin routes — require admin role
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png (public files)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|icons|templates).*)',
  ],
};
