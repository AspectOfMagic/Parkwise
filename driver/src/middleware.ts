import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// testing driver page
// const publicRoutes = ['/', '/en', '/cn', '/login'];

const publicRoutes = ['/login', '/cn/login'];

export default async function middleware(req: NextRequest) { 
  const res = intlMiddleware(req);
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    req.nextUrl.pathname.includes('/public')
  ) {
    return
  }
  // Skip middleware for public routes or non-page requests
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return res;
  }

  try {
    const response = await fetch('http://localhost:3010/api/v0/checkDriver', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.cookies.get('session')?.value || ''}`,
      },
    });
    if (response.status !== 200) {
      throw new Error('Unauthorized');
    }
  } catch {
    return NextResponse.redirect(new URL('/driver/login', req.url));
  }
  return res;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/:path*'
  ],
};
