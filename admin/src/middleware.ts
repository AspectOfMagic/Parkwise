import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';

// Routes that don't require authentication
const publicRoutes = ['/login'];

export default async function middleware(req: NextRequest) {
  // Skip middleware for public routes or non-page requests
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  try {
    // Call the authentication microservice
    const response = await fetch('http://localhost:3010/api/v0/checkAdmin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.cookies.get('session')?.value || ''}`,
      },
    });
    
    if (response.status !== 200) {
      throw new Error('Unauthorized');
    }
  } catch {
    // Redirect to login if auth fails
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
