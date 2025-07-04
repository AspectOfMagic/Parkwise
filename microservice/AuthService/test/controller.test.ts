import { test, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import * as http from 'http'
import * as jwt from 'jsonwebtoken'
import * as db from './db'
import { pool } from '../src/db'
import * as dotenv from 'dotenv'
import { AuthController } from '../src/auth/controller'
import { Credentials, newAccountCredentials } from '../src/auth'
import * as express from 'express'
import { AuthService } from '../src/auth/service'
dotenv.config()

// Test credentials
const tommyCreds: Credentials = {
  'email': 'tommy@books.com',
  'password': 'tommytimekeeper'
}

const mollyCreds: Credentials = {
  'email': 'molly@books.com',
  'password': 'mollymember'
}

const annaCreds: Credentials = {
  'email': 'anna@books.com',
  'password': 'annaadmin'
}

const newUserCreds: newAccountCredentials = {
  'email': 'newuser@books.com',
  'password': 'newuserpass',
  'name': 'New User'
}

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
  server = http.createServer()
  server.listen()
  await db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
})

beforeEach(async () => {
  await db.reset()
})

test('AuthController login should authenticate drivers', async () => {
  const controller = new AuthController()
  
  const result = await controller.login(tommyCreds)
  
  expect(result).toBeDefined()
  expect(result?.accessToken).toBeDefined()
  
  const decoded = jwt.decode(result!.accessToken) as { id: string }
  expect(decoded.id).toBeDefined()
})

test('AuthController login should reject invalid credentials', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const result = await controller.login({
    email: 'tommy@books.com',
    password: 'wrongpassword'
  })
  
  expect(statusCode).toBe(401)
})

test('AuthController loginEnforcer should authenticate Enforcers', async () => {
  const controller = new AuthController()
  
  const result = await controller.loginEnforcer(mollyCreds)

  const decoded = jwt.decode(result!.accessToken) as { id: string }
  expect(decoded.id).toBeDefined()
})

test('AuthController loginEnforcer should reject invalid credentials', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const result = await controller.loginEnforcer({
    email: 'tommy@books.com',
    password: 'wrongpassword'
  })
  
  expect(statusCode).toBe(401)
})

test('AuthController loginAdmin should authenticate admins', async () => {
  const controller = new AuthController()
  
  const result = await controller.loginAdmin(annaCreds)
  
  const decoded = jwt.decode(result!.accessToken) as { id: string }
  expect(decoded.id).toBeDefined()
})

test('AuthController loginAdmin should reject invalid credentials', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const result = await controller.loginAdmin({
    email: 'tommy@books.com',
    password: 'wrongpassword'
  })
  
  expect(statusCode).toBe(401)
})

test('AuthController signup should create a new account', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const result = await controller.signup(newUserCreds)
  
  expect(result?.email).toBe(newUserCreds.email)
})

test('AuthController signup should reject existing email', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const existingEmailCreds: newAccountCredentials = {
    email: tommyCreds.email,
    password: 'newpassword',
    name: 'Existing Email User'
  }
  
  const result = await controller.signup(existingEmailCreds)
  
  expect(statusCode).toBe(400)
})

test('AuthController checkDriver should return driver session user', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginDriver(tommyCreds)
  const token = authResult?.accessToken
  
  const decoded = jwt.decode(token!) as { id: string }
  const driverId = decoded.id
  
  const mockRequest = {
    user: {
      id: driverId,
      role: 'driver'
    }
  } as express.Request
  
  const controller = new AuthController()
  const result = await controller.checkDriver(mockRequest)
  
  expect(result?.role).toBe('driver')
})

test('AuthController checkEnforcer should return enforcer session user', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginEnforcer(mollyCreds)
  const token = authResult?.accessToken
  
  const decoded = jwt.decode(token!) as { id: string }
  const enforcerId = decoded.id
  
  const mockRequest = {
    user: {
      id: enforcerId,
      role: 'enforcer'
    }
  } as express.Request
  
  const controller = new AuthController()
  const result = await controller.checkEnforcer(mockRequest)
  
  expect(result?.role).toBe('enforcer')
})

test('AuthController checkAdmin should return admin session user', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginAdmin(annaCreds)
  const token = authResult?.accessToken
  
  const decoded = jwt.decode(token!) as { id: string }
  const adminId = decoded.id
  
  const mockRequest = {
    user: {
      id: adminId,
      role: 'admin'
    }
  } as express.Request
  
  const controller = new AuthController()
  const result = await controller.checkAdmin(mockRequest)
  
  expect(result?.role).toBe('admin')
})

const mollySignupCreds = {
  'name': 'Molly Member',
  'email': 'molly@books.com',
  'password': 'mollymember'
}

const testCalumCreds = {
	'name': 'Cozy Calum',
	'email': 'cozycalum@books.com',
	'password': 'cozycalum'
}

test('AuthController createEnforcer should create a new enforcer', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const result = await controller.createEnforcer(newUserCreds)
  
  expect(result?.email).toBe(newUserCreds.email)
})

test('AuthController createEnforcer should reject existing email', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const existingEmailCreds: newAccountCredentials = {
    email: mollySignupCreds.email,
    password: 'newpassword',
    name: 'Existing Email User'
  }
  
  const result = await controller.createEnforcer(existingEmailCreds)
  
  expect(statusCode).toBe(400)
})

test('AuthController getEnforcers should return list of enforcers', async () => {
  const controller = new AuthController()
  
  const result = await controller.getEnforcers()
  
  // Assuming molly is an enforcer from your test data
  expect(result.length).toBeGreaterThan(0)
})

test('should return empty array when no enforcers exist', async () => {
  const controller = new AuthController()
  
  // Mock the database to return empty results
  vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [] } as any)
  
  const result = await controller.getEnforcers()
  
  expect(result).toEqual([])
  expect(result.length).toBe(0)
  expect(Array.isArray(result)).toBe(true)
})

test('AuthController deleteEnforcer should remove enforcer', async () => {
  const controller = new AuthController()
  
  // First create an enforcer to delete
  const newEnforcerResult = await controller.createEnforcer(newUserCreds)
  const authService = new AuthService()
  const authResult = await authService.loginEnforcer(mollyCreds)
  const token = authResult?.accessToken
  const decoded = jwt.decode(token!) as { id: string }
  const enforcerID = { id: decoded.id }
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const result = await controller.deleteEnforcer(enforcerID)
  
  expect(result?.id).toBe(enforcerID.id)
})

test('AuthController deleteEnforcer should handle non-existent enforcer', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const nonExistentID = { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }
  const result = await controller.deleteEnforcer(nonExistentID)
  
  // Depending on your service implementation, this might return undefined or set an error status
  expect(result).toBeUndefined()
})

test('AuthController getDriver should return driver information', async () => {
  const controller = new AuthController()
  
  // Get Tommy's driver ID from login
  const authService = new AuthService()
  const authResult = await authService.loginDriver(tommyCreds)
  const token = authResult?.accessToken
  
  const decoded = jwt.decode(token!) as { id: string }
  const driverId = decoded.id
  
  const result = await controller.getDriver(driverId)
  expect(result?.email).toBe(tommyCreds.email)
})

test('AuthController getDriver should handle non-existent driver', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const result = await controller.getDriver('3fa85f64-5717-4562-b3fc-2c963f66afa6')
  
  expect(result).toBeUndefined()
})

test('AuthController googleLogin should authenticate with valid Google credential', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  // Mock the service to return a successful result
  const mockResult = {
    name: 'Google User',
    email: 'googleuser@gmail.com',
    accessToken: 'mock.access.token'
  }
  
  const spy = vi.spyOn(AuthService.prototype, 'googleLogin')
    .mockResolvedValue(mockResult)
  
  const mockGoogleCredential = {
    credential: 'valid.google.jwt.token'
  }
  
  const result = await controller.googleLogin(mockGoogleCredential)
  
  expect(result).toBeDefined()
  expect(result).toEqual(mockResult)
  expect(statusCode).toBe(0) // No error status should be set
  
  spy.mockRestore()
})

test('AuthController googleLogin should handle invalid Google credential', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const invalidCredential = {
    credential: 'invalid.jwt.token'
  }
  
  const result = await controller.googleLogin(invalidCredential)
  
  expect(result).toBeUndefined()
  expect(statusCode).toBe(401) // Service catches Google verification error and returns undefined
})

test('AuthController googleLogin should handle empty credential', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  const emptyCredential = {
    credential: '' // Empty credential
  }
  
  const result = await controller.googleLogin(emptyCredential)
  
  expect(result).toBeUndefined()
  expect(statusCode).toBe(401) // Service returns undefined for empty credential
})

test('AuthController googleLogin should handle service exceptions with 400 status', async () => {
  const controller = new AuthController()
  
  let statusCode = 0
  controller.setStatus = (code: number) => { statusCode = code }
  
  // Spy on the googleLogin method to make it throw
  const spy = vi.spyOn(AuthService.prototype, 'googleLogin')
    .mockRejectedValue(new Error('Database connection failed'))
  
  const testCredential = {
    credential: 'valid.looking.credential'
  }
  
  const result = await controller.googleLogin(testCredential)
  
  expect(result).toBeUndefined()
  expect(statusCode).toBe(400) // Should catch the exception and set 400
  
  spy.mockRestore()
})
