import { test, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import * as http from 'http'

import * as db from './db'
import app from '../src/app'
import { AuthService } from '../src/auth/service'
import { Credentials } from '../src/auth/index'

// Mock the Google Auth Library
const mockVerifyIdToken = vi.fn()
vi.mock('google-auth-library', () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken
  }))
}))

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll( async () => {
  server = http.createServer(app)
  server.listen()
  await db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
})

beforeEach( async() => {
  await db.reset()
  vi.clearAllMocks()
})

const tommyCreds = {
	'email': 'tommy@books.com',
	'password': 'tommytimekeeper'
}

const mollyCreds = {
	'email': 'molly@books.com',
	'password': 'mollymember'
}

const annaCreds = {
	'email': 'anna@books.com',
	'password': 'annaadmin'
}

test('Login Driver Returns Authenticated Object on Valid Credentials', async () => {
	let authService = new AuthService()
	await authService.loginDriver(tommyCreds)
	  .then((res) => {
			expect(200)
			expect(res?.name).toBe('Tommy Timekeeper')
		})
})

test('Login Driver Returns Undefined on Invalid Credentials', async () => {
	let authService = new AuthService()
	const mockCreds: Credentials = {email: 'invalid@user.com', password: 'noAccess'};

	const result = await authService.loginDriver(mockCreds)
	expect(result).toBeUndefined();
})

test('Login Enforcer Returns Authenticated Object on Valid Credentials', async () => {
	let authService = new AuthService()
	await authService.loginEnforcer(mollyCreds)
	  .then((res) => {
			expect(200)
			expect(res?.name).toBe('Molly Member')
		})
})

test('Login Enforcer Returns Undefined on Invalid Credentials', async () => {
	let authService = new AuthService()
	const mockCreds: Credentials = {email: 'invalid@user.com', password: 'noAccess'};

	const result = await authService.loginEnforcer(mockCreds)
	expect(result).toBeUndefined();
})

test('Login Admin Returns Authenticated Object on Valid Credentials', async () => {
	let authService = new AuthService()
	await authService.loginAdmin(annaCreds)
	  .then((res) => {
			expect(200)
			expect(res?.name).toBe('Anna Admin')
		})
})

test('Login Admin Returns Undefined on Invalid Credentials', async () => {
	let authService = new AuthService()
	const mockCreds: Credentials = {email: 'invalid@user.com', password: 'noAccess'};

	const result = await authService.loginAdmin(mockCreds)
	expect(result).toBeUndefined();
})

// Google Login Tests
test('Google Login Returns Undefined on Empty Credential', async () => {
	let authService = new AuthService()
	const result = await authService.googleLogin('')
	expect(result).toBeUndefined()
})

test('Google Login Returns Undefined on Null Credential', async () => {
	let authService = new AuthService()
	const result = await authService.googleLogin(null as any)
	expect(result).toBeUndefined()
})

test('Google Login Returns Undefined on Invalid Token', async () => {
	let authService = new AuthService()
	mockVerifyIdToken.mockRejectedValueOnce(new Error('Invalid token'))
	
	const result = await authService.googleLogin('invalid-token')
	expect(result).toBeUndefined()
})

test('Google Login Returns Undefined When Token Has No Payload', async () => {
	let authService = new AuthService()
	const mockTicket = {
		getPayload: vi.fn().mockReturnValueOnce(null)
	}
	mockVerifyIdToken.mockResolvedValueOnce(mockTicket)
	
	const result = await authService.googleLogin('valid-token')
	expect(result).toBeUndefined()
})

test('Google Login Creates New Driver When User Does Not Exist', async () => {
	let authService = new AuthService()
	const mockPayload = {
		email: 'newuser@example.com',
		name: 'New User'
	}
	const mockTicket = {
		getPayload: vi.fn().mockReturnValueOnce(mockPayload)
	}
	mockVerifyIdToken.mockResolvedValueOnce(mockTicket)

	const result = await authService.googleLogin('valid-token')

	expect(result).toBeDefined()
	expect(result?.name).toBe('New User')
	expect(result?.email).toBe('newuser@example.com')
	expect(result?.accessToken).toBeDefined()
	expect(typeof result?.accessToken).toBe('string')
})

test('Google Login Returns Existing Driver When User Exists', async () => {
	let authService = new AuthService()
	
	// First, create a user via Google login
	const mockPayload = {
		email: 'existing@example.com',
		name: 'Existing User'
	}
	const mockTicket = {
		getPayload: vi.fn().mockReturnValue(mockPayload)
	}
	mockVerifyIdToken.mockResolvedValue(mockTicket)

	// First login creates the user
	const firstResult = await authService.googleLogin('valid-token')
	expect(firstResult).toBeDefined()

	// Second login should return the existing user
	const secondResult = await authService.googleLogin('valid-token')
	
	expect(secondResult).toBeDefined()
	expect(secondResult?.name).toBe('Existing User')
	expect(secondResult?.email).toBe('existing@example.com')
	expect(secondResult?.accessToken).toBeDefined()
	expect(typeof secondResult?.accessToken).toBe('string')
})

test('Google Login Verifies Token With Correct Audience', async () => {
	let authService = new AuthService()
	const mockPayload = {
		email: 'test@example.com',
		name: 'Test User'
	}
	const mockTicket = {
		getPayload: vi.fn().mockReturnValueOnce(mockPayload)
	}
	mockVerifyIdToken.mockResolvedValueOnce(mockTicket)

	await authService.googleLogin('test-token')

	// Verify verifyIdToken was called with correct parameters
	expect(mockVerifyIdToken).toHaveBeenCalledWith({
		idToken: 'test-token',
		audience: '695579055672-g224ijr01525qcvrluoj2bdaloprrevh.apps.googleusercontent.com'
	})
})
