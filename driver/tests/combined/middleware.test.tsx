import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse, NextRequest } from 'next/server';
import middleware from '@/middleware';

vi.mock('next-intl/middleware', () => ({
  default: () => () => NextResponse.next()
}));

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = vi.fn();
});

function createMockRequest(pathname: string, sessionValue: string | undefined = 'valid-session'): NextRequest {
  const fullUrl = `http://localhost:3000${pathname}`;
  return {
    url: fullUrl,
    nextUrl: new URL(fullUrl),
    cookies: {
      get: (key: string) => (key === 'session' && sessionValue ? { value: sessionValue } : undefined)
    }
  } as unknown as NextRequest;
}

describe('middleware', () => {
  it('allows public routes to pass through', async () => {
    const req = createMockRequest('/login');
    const res = await middleware(req);
    expect(res).toEqual(NextResponse.next());
  });

  it('redirects if user is unauthorized (missing session)', async () => {
    const req = createMockRequest('/driver/home', undefined);
    (global.fetch as any).mockResolvedValue({ status: 401 });

    const res = await middleware(req);
    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toBe('http://localhost:3000/driver/login');
  });

  it('lets authorized user access protected route', async () => {
    const req = createMockRequest('/driver/home');
    (global.fetch as any).mockResolvedValue({ status: 200 });

    const res = await middleware(req);
    expect(res).toEqual(NextResponse.next());
  });
  it('skips middleware for /_next assets', async () => {
  const req = createMockRequest('/_next/static/js/somefile.js');
  const res = await middleware(req);
  expect(res).toBeUndefined(); // because `return` early
  });

  it('skips middleware for /api/ route', async () => {
  const req = createMockRequest('/api/data');
  const res = await middleware(req);
  expect(res).toBeUndefined();
  });

  it('skips middleware for /public assets', async () => {
  const req = createMockRequest('/public/image.png');
  const res = await middleware(req);
  expect(res).toBeUndefined();
  });
  it('falls back to empty string when session.value is missing', async () => {
  const req = {
    url: 'http://localhost:3000/driver/home',
    nextUrl: new URL('http://localhost:3000/driver/home'),
    cookies: {
      get: () => ({})
    }
    } as unknown as NextRequest;

    (global.fetch as any).mockResolvedValue({ status: 401 });

    const res = await middleware(req);
    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toBe('http://localhost:3000/driver/login');
  });
});
