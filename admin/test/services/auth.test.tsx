import { it, expect, beforeEach, vi } from 'vitest';

import { verifyAuth, authenticate, createEnforcer, getEnforcers, deleteEnforcer } from '../../src/auth/service';

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
  const mockUser = { id: 'user123', role: 'admin' };

  // Mock successful response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => mockUser
  });

  const result = await verifyAuth('valid-token');

  // Verify fetch was called correctly
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/checkAdmin', {
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

  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/checkAdmin', {
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
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/loginAdmin', {
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
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/loginAdmin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockCredentials),
  });
});

it('should correctly createEnforcer with valid credentials', async () => {
  const mockCredentials = { 
    email: 'enforcer@books.com', 
    password: 'enforcerpass',
    name: 'Test Enforcer' 
  };
  const mockCreatedAccount = {
    id: 'enforcer123',
    email: 'enforcer@books.com',
    name: 'Test Enforcer',
    createdAt: '2025-01-01T00:00:00Z'
  };

  // Mock successful creation response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 201,
    json: async () => mockCreatedAccount
  });

  const result = await createEnforcer(mockCredentials);

  // Verify fetch was called correctly
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/createEnforcer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockCredentials),
  });

  // Verify result matches expected response
  expect(result).toEqual(mockCreatedAccount);
});

it('should throw error when createEnforcer fails', async () => {
  const mockCredentials = { 
    email: 'invalid@books.com', 
    password: 'weakpass',
    name: 'Invalid User' 
  };
  const errorMessage = 'Email already exists';

  // Mock failed creation response
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 400,
    text: async () => errorMessage
  });

  // Verify error is thrown with the correct message
  await expect(createEnforcer(mockCredentials)).rejects.toThrow(
    `Authentication failed with status 400: ${errorMessage}`
  );

  // Verify fetch was called with correct parameters
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/createEnforcer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockCredentials),
  });
});

it('should correctly getEnforcers with valid credentials', async () => {
  const mockEnforcers = [
    { id: 'enforcer1', name: 'John Enforcer', email: 'john@books.com' },
    { id: 'enforcer2', name: 'Jane Enforcer', email: 'jane@books.com' }
  ];

  // Mock successful response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => mockEnforcers
  });

  const result = await getEnforcers('valid-token');

  // Verify fetch was called correctly
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/getEnforcers', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer valid-token',
      'Content-Type': 'application/json',
    },
  });

  // Verify result matches expected response
  expect(result).toEqual(mockEnforcers);
});

it('should throw error when getEnforcers fails', async () => {
  const errorMessage = 'Forbidden - Insufficient permissions';

  // Mock failed response
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 403,
    text: async () => errorMessage
  });

  // Verify error is thrown with the correct message
  await expect(getEnforcers('invalid-token')).rejects.toThrow(
    `Authentication failed with status 403: ${errorMessage}`
  );

  // Verify fetch was called with correct parameters
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/getEnforcers', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid-token',
      'Content-Type': 'application/json',
    },
  });
});
// getEnforcers

it('should correctly deleteEnforcer with valid credentials', async () => {
  const enforcerId = 'enforcer123';
  const mockDeletedEnforcer = {
    id: 'enforcer123',
    name: 'Deleted Enforcer',
    email: 'deleted@books.com',
    deletedAt: '2025-01-01T00:00:00Z'
  };

  // Mock successful deletion response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => mockDeletedEnforcer
  });

  const result = await deleteEnforcer('valid-token', enforcerId);

  // Verify fetch was called correctly
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/deleteEnforcer', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer valid-token',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: enforcerId }),
  });

  // Verify result matches expected response
  expect(result).toEqual(mockDeletedEnforcer);
});

it('should throw error when deleteEnforcer fails', async () => {
  const enforcerId = 'nonexistent123';
  const errorMessage = 'Enforcer not found';

  // Mock failed deletion response
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
    text: async () => errorMessage
  });

  // Verify error is thrown with the correct message
  await expect(deleteEnforcer('valid-token', enforcerId)).rejects.toThrow(
    `Authentication failed with status 404: ${errorMessage}`
  );

  // Verify fetch was called with correct parameters
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:3010/api/v0/deleteEnforcer', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer valid-token',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: enforcerId }),
  });
});
// deleteEnforcer
