import { it, expect, beforeEach, vi, afterEach } from 'vitest';

import { login, logout } from '../../src/app/login/actions';
import { Credentials } from '../../src/auth/index';
import * as authService from '../../src/auth/service';
import * as nextHeaders from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('../../src/auth/service', () => ({
  authenticate: vi.fn(),
}));

const mockCookieStore = {
  set: vi.fn(),
  delete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (nextHeaders.cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockCookieStore);
});

afterEach(() => {
  vi.resetAllMocks();
});

it('should set session cookie and return user data when authentication succeeds', async () => {
  const testCredentials: Credentials = {
    email: 'testuser@example.com',
    password: 'password123',
  };

  const mockUser = {
    name: 'Test User',
    accessToken: 'mock-token-123',
  };

  (authService.authenticate as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockUser);

  const result = await login(testCredentials);

  expect(authService.authenticate).toHaveBeenCalledWith(testCredentials);

  expect(mockCookieStore.set).toHaveBeenCalled();
  expect(mockCookieStore.set).toHaveBeenCalledWith(
    'session',
    'mock-token-123',
    expect.objectContaining({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: expect.any(Date),
    })
  );

  expect(result).toEqual({
    name: 'Test User',
    accessToken: 'mock-token-123',
  });
});

it('should return undefined when authentication fails', async () => {
  const testCredentials: Credentials = {
    email: 'wronguser@example.com',
    password: 'wrongpassword',
  };

  (authService.authenticate as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

  const result = await login(testCredentials);

  expect(authService.authenticate).toHaveBeenCalledWith(testCredentials);

  expect(mockCookieStore.set).not.toHaveBeenCalled();

  expect(result).toBeUndefined();
});

it('should delete the session cookie', async () => {
  await logout();

  expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
});