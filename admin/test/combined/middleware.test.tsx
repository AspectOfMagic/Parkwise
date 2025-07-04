import { it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import middleware from '../../src/middleware';

vi.mock('next/server', async () => {
  const originalModule = await vi.importActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: vi.fn().mockReturnValue({ type: 'next' }),
      redirect: vi.fn().mockImplementation((url) => ({ type: 'redirect', url })),
    },
  };
});

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

it('should allow public routes without authentication', async () => {
  // Create a mock request for a public route
  const req = {
    nextUrl: { pathname: '/login' },
  } as unknown as NextRequest;

  await middleware(req);

  // Should call NextResponse.next without attempting to authenticate
  expect(NextResponse.next).toHaveBeenCalledTimes(1);
  expect(global.fetch).not.toHaveBeenCalled();
});

it('should allow authenticated requests to protected routes', async () => {
  // Mock successful authentication response
  (global.fetch as any).mockResolvedValueOnce({
    status: 200,
  });

  // Create a mock request for a protected route with a session cookie
  const req = {
    nextUrl: { pathname: '/admin' },
    cookies: {
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    },
    url: 'http://localhost:3001/admin',
  } as unknown as NextRequest;

  await middleware(req);

  // Should call authentication endpoint
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/checkAdmin', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer valid-token',
    },
  });

  // Should allow the request to proceed
  expect(NextResponse.next).toHaveBeenCalledTimes(1);
  expect(NextResponse.redirect).not.toHaveBeenCalled();
});

it('should redirect unauthenticated requests to login', async () => {
  // Mock failed authentication response
  (global.fetch as any).mockResolvedValueOnce({
    status: 401,
  });

  // Create a mock request for a protected route without a valid session
  const req = {
    nextUrl: { pathname: '/admin' },
    cookies: {
      get: vi.fn().mockReturnValue({ value: 'invalid-token' }),
    },
    url: 'http://localhost:3001/admin',
  } as unknown as NextRequest;

  await middleware(req);

  // Should attempt to authenticate
  expect(global.fetch).toHaveBeenCalled();

  // Should redirect to login
  expect(NextResponse.redirect).toHaveBeenCalledWith(
    expect.objectContaining({ pathname: '/admin/login' })
  );
  expect(NextResponse.next).not.toHaveBeenCalled();
});

it('should redirect when authentication service is unavailable', async () => {
  // Mock network error
  (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

  // Create a mock request for a protected route
  const req = {
    nextUrl: { pathname: '/admin' },
    cookies: {
      get: vi.fn().mockReturnValue({ value: 'some-token' }),
    },
    url: 'http://localhost:3001/admin',
  } as unknown as NextRequest;

  await middleware(req);

  // Should attempt to authenticate
  expect(global.fetch).toHaveBeenCalled();

  // Should redirect to login due to auth service error
  expect(NextResponse.redirect).toHaveBeenCalledWith(
    expect.objectContaining({ pathname: '/admin/login' })
  );
});

it('should handle missing session cookie', async () => {
  // Create a mock request for a protected route without a session cookie
  const req = {
    nextUrl: { pathname: '/admin' },
    cookies: {
      get: vi.fn().mockReturnValue(undefined),
    },
    url: 'http://localhost:3001/admin',
  } as unknown as NextRequest;

  // Mock failed authentication
  (global.fetch as any).mockResolvedValueOnce({
    status: 401,
  });

  await middleware(req);

  // Should attempt to authenticate with empty token
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/checkAdmin', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ',
    },
  });

  // Should redirect to login
  expect(NextResponse.redirect).toHaveBeenCalled();
});
