import { it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/auth/service', () => ({
  authenticate: vi.fn(),
  register: vi.fn(),
  googleLogin: vi.fn(),
}));

import { login, signup, googleLoginAction, logout } from '@/app/[locale]/login/actions';
import { authenticate, register, googleLogin } from '@/auth/service';

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const mockCookieStore = {
  set: vi.fn(),
  delete: vi.fn(),
};

const mockUser = {
  name: 'John',
  email: 'john@example.com',
  accessToken: 'mock-token',
};

beforeEach(() => {
  vi.clearAllMocks();
  (cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockCookieStore);
});

it('login sets cookie and returns user info if authenticated', async () => {
  (authenticate as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

  const result = await login({ email: 'john@example.com', password: 'password123' });

  expect(authenticate).toHaveBeenCalled();
  expect(mockCookieStore.set).toHaveBeenCalledWith('session', 'mock-token', expect.objectContaining({
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  }));
  expect(result).toEqual({ name: 'John', email: 'john@example.com' });
});

it('login returns undefined if authentication fails', async () => {
  (authenticate as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  const result = await login({ email: 'bad@example.com', password: 'wrong' });

  expect(result).toBeUndefined();
});

it('signup sets cookie and returns user info if successful', async () => {
  (register as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

  const result = await signup({ name: 'John', email: 'john@example.com', password: 'pass' });

  expect(register).toHaveBeenCalled();
  expect(mockCookieStore.set).toHaveBeenCalledWith('session', 'mock-token', expect.any(Object));
  expect(result).toEqual({ name: 'John', email: 'john@example.com' });
});

it('signup returns undefined if registration fails', async () => {
  (register as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  const result = await signup({ name: 'Bad', email: 'bad@example.com', password: 'fail' });

  expect(result).toBeUndefined();
});

it('googleLoginAction sets cookie and returns user info if valid token', async () => {
  (googleLogin as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

  const result = await googleLoginAction('valid-id-token');

  expect(googleLogin).toHaveBeenCalledWith('valid-id-token');
  expect(mockCookieStore.set).toHaveBeenCalledWith('session', 'mock-token', expect.any(Object));
  expect(result).toEqual({ name: 'John', email: 'john@example.com' });
});

it('googleLoginAction returns undefined if login fails', async () => {
  (googleLogin as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  const result = await googleLoginAction('invalid-token');

  expect(result).toBeUndefined();
});

it('logout deletes session cookie', async () => {
  await logout();

  expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
});
