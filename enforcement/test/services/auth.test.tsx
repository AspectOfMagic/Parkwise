import { it, expect, beforeEach, vi } from 'vitest';

import { verifyAuth, authenticate } from '../../src/auth/service';

vi.mock('server-only', () => ({}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console.log to avoid cluttering test output
console.log = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
  vi.clearAllMocks();
});

it('should throw an error when no token is provided', async () => {
  await expect(verifyAuth(undefined)).rejects.toThrow('Unauthorized - No token provided');
});

it('should return session user data when authentication is successful', async () => {
  const mockUser = { id: 'user123', role: 'enforcer' };

  // Mock successful response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => mockUser
  });

  const result = await verifyAuth('valid-token');

  // Verify fetch was called correctly
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/checkEnforcer', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer valid-token'
    }
  });

  // Verify result matches expected user data
  expect(result).toEqual(mockUser);
});

it('should throw an error when authentication service returns non-200 status', async () => {
  // Mock unauthorized response
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
    text: async () => 'Unauthorized'
  });

  await expect(verifyAuth('invalid-token')).rejects.toThrow('Unauthorized');

  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/checkEnforcer', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid-token'
    }
  });
});

it('should authenticate user with valid credentials', async () => {
  const mockCredentials = { email: 'test@books.com', password: 'testuser' };
  const mockAuthResponse = {
    name: 'Test User',
    accessToken: 'valid-access-token'
  };

  // Mock successful authentication response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => mockAuthResponse
  });

  const result = await authenticate(mockCredentials);

  // Verify fetch was called correctly
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/loginEnforcer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockCredentials),
  });

  // Verify result matches expected response
  expect(result).toEqual(mockAuthResponse);
});

it('should throw error when authentication fails', async () => {
  const mockCredentials = { email: 'test@books.com', password: 'wrongpassword' };
  const errorMessage = 'Invalid credentials';

  // Mock failed authentication response
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
    text: async () => errorMessage
  });

  // Verify error is thrown with the correct message
  await expect(authenticate(mockCredentials)).rejects.toThrow(
    `Authentication failed with status 401: ${errorMessage}`
  );

  // Verify fetch was called with correct parameters
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/loginEnforcer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockCredentials),
  });
});