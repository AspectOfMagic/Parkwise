import { it, expect, vi, beforeEach } from 'vitest';
import { NextResponse, NextRequest } from 'next/server';
import middleware, {config} from '@/middleware';

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

it('allows public routes to pass through', async () => {
  const req = createMockRequest('/');
  const res = await middleware(req);
  expect(res).toEqual(NextResponse.next());
});

it('has correct matcher configuration', () => {
  expect(config.matcher).toEqual([
    '/',
    '/(en|cn)/:path*'
  ]);
});

it('includes root path in matcher', () => {
  expect(config.matcher).toContain('/');
});

it('includes locale pattern in matcher', () => {
  expect(config.matcher).toContain('/(en|cn)/:path*');
});

it('only matches specified locales', () => {
  const localePattern = config.matcher.find(pattern => pattern.includes('(en|cn)'));
  expect(localePattern).toBe('/(en|cn)/:path*');
});