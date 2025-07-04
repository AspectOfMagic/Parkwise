import { test, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import * as http from 'http'
import * as jwt from 'jsonwebtoken'

import * as db from './db'
import { expressAuthentication } from '../src/auth/express'
import { AuthService } from '../src/auth/service'

import * as dotenv from 'dotenv'
dotenv.config()

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

test('expressAuthentication should reject invalid tokens', async () => {
  const request = { headers: { authorization: 'Bearer invalid.token.here' } }
  
  await expect(expressAuthentication(request as any, 'whatever', ['driver']))
    .rejects.toThrow()
})

test('expressAuthentication should reject missing tokens', async () => {
  const request = { headers: {} }
  
  await expect(expressAuthentication(request as any, 'whatever', ['driver']))
    .rejects.toThrow('Unauthorized')
})

test('expressAuthentication should authenticate drivers', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginDriver(tommyCreds)
  const validToken = authResult?.accessToken
  const decoded = jwt.decode(validToken!) as unknown as { id: string }
  const driverId = decoded.id
  
  const request = { headers: { authorization: `Bearer ${validToken}` } }
  const user = await expressAuthentication(request as any, 'whatever', ['driver'])
  
  expect(user).toBeDefined()
  expect(user.id).toBe(driverId)
  expect(user.role).toBe('driver')
})

test('expressAuthentication should authenticate enforcers', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginEnforcer(mollyCreds)
  const validToken = authResult?.accessToken
  const decoded = jwt.decode(validToken!) as unknown as { id: string }
  const enforcerId = decoded.id
  
  const request = { headers: { authorization: `Bearer ${validToken}` } }
  const user = await expressAuthentication(request as any, 'whatever', ['enforcer'])
  
  expect(user).toBeDefined()
  expect(user.id).toBe(enforcerId)
  expect(user.role).toBe('enforcer')
})

test('expressAuthentication should authenticate admins', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginAdmin(annaCreds)
  const validToken = authResult?.accessToken
  const decoded = jwt.decode(validToken!) as unknown as { id: string }
  const adminId = decoded.id
  
  const request = { headers: { authorization: `Bearer ${validToken}` } }
  const user = await expressAuthentication(request as any, 'whatever', ['admin'])
  
  expect(user).toBeDefined()
  expect(user.id).toBe(adminId)
  expect(user.role).toBe('admin')
})

test('expressAuthentication should reject unknown roles', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginDriver(tommyCreds)
  const validToken = authResult?.accessToken
  
  const request = { headers: { authorization: `Bearer ${validToken}` } }
  await expect(expressAuthentication(request as any, 'whatever', ['unknown-role']))
    .rejects.toThrow('Unknown role')
})

test('expressAuthentication should reject undefined roles', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginDriver(tommyCreds)
  const validToken = authResult?.accessToken
  
  const request = { headers: { authorization: `Bearer ${validToken}` } }
  await expect(expressAuthentication(request as any, 'whatever'))
    .rejects.toThrow()
})
