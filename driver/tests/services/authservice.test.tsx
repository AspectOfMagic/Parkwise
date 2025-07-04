import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  verifyAuth,
  authenticate,
  register,
  googleLogin,
} from '@/auth/service';

vi.mock('server-only', () => ({}));

let errorSpy: any;
let logSpy: any;

beforeEach(() => {
  vi.resetAllMocks();
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
  errorSpy.mockRestore();
  logSpy.mockRestore();
});

describe('verifyAuth', () => {
  it('throws if no token is provided', async () => {
    await expect(verifyAuth(undefined)).rejects.toThrow('Unauthorized - No token provided');
  });

  it('returns user if token is valid', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ name: 'Driver' }),
    });

    const result = await verifyAuth('mock-token');
    expect(result).toEqual({ name: 'Driver' });
  });

  it('throws if status is not 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      json: async () => ({}),
    });

    await expect(verifyAuth('bad-token')).rejects.toThrow('Unauthorized');
  });

  it('throws if fetch throws error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

    await expect(verifyAuth('token')).rejects.toThrow('Unauthorized');
  });
});

describe('authenticate', () => {
  const creds = { email: 'a@test.com', password: 'pass123' };

  it('resolves if login is successful', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ token: 'abc' }),
    });

    const result = await authenticate(creds);
    expect(result).toEqual({ token: 'abc' });
  });

  it('rejects if status is not 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      json: async () => ({}),
    });

    await expect(authenticate(creds)).rejects.toBe('Unauthorized');
  });

  it('rejects if fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(authenticate(creds)).rejects.toBe('Unauthorized');
  });
});

describe('register', () => {
  const newCreds = { name: 'Yoyo', email: 'a@test.com', password: '123' };

  it('resolves if registration is successful', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      json: async () => ({ token: 'new-token' }),
    });

    const result = await register(newCreds);
    expect(result).toEqual({ token: 'new-token' });
  });

  it('rejects if status is not 201', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 400,
      json: async () => ({}),
    });

    await expect(register(newCreds)).rejects.toBe('Unauthorized');
  });

  it('rejects if fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(register(newCreds)).rejects.toBe('Unauthorized');
  });
});

describe('googleLogin', () => {
  const token = 'google-id-token';

  it('returns user on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'valid' }),
    });

    const result = await googleLogin(token);
    expect(result).toEqual({ token: 'valid' });
  });

  it('throws on 401 or 403', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(googleLogin(token)).rejects.toThrow('Invalid credentials');
  });

  it('throws specific error if 500 and errorData.message exists', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ message: 'Could not process the server response.' }),
    });

    await expect(googleLogin(token)).rejects.toThrow('Server error (500): Could not process the server response.');
  });

  it('throws generic server error if 500 and errorData has no message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    });

    await expect(googleLogin(token)).rejects.toThrow(
      'Server error (500): Could not process the server response.'
    );
  });

  it('throws generic error if 500 with unparseable JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => { throw new Error('bad json'); },
    });

    await expect(googleLogin(token)).rejects.toThrow('Could not process the server response');
  });

  it('throws for other status codes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 418,
    });

    await expect(googleLogin(token)).rejects.toThrow('Authentication failed with status code: 418');
  });

  it('throws final fallback error if caught error is not an instance of Error', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      throw 'non-error-string';
    });

    await expect(googleLogin(token)).rejects.toThrow('Authentication failed due to an unexpected error.');
  });
});
