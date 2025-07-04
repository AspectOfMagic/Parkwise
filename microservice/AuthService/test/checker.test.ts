import { test, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import * as http from 'http'
import * as jwt from 'jsonwebtoken'

import * as db from './db'
import app from '../src/app'
import { AuthService } from '../src/auth/service'


import * as dotenv from 'dotenv'
dotenv.config()

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
  server = http.createServer(app)
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

test('Check Driver Resolves User ID on Valid JWT', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginDriver(tommyCreds)
  const validToken = authResult?.accessToken;
  const decoded = jwt.decode(validToken!) as unknown as { id: string };
  let driverId = decoded.id;
  const authHeader = `Bearer ${validToken}`

  const result = await authService.checkDriver(authHeader)
  expect(result).toEqual({ id: driverId, role: 'driver' })
})

test('Check Driver Rejects No Provided Auth Header', async () => {
  const authService = new AuthService()

  await expect(async () => {
    await authService.checkDriver(undefined)
  }).rejects.toThrow('Unauthorized')
})

test('Check Driver Rejects On Failed JWT Verification', async () => {
  const authService = new AuthService()
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZha2UtaWQiLCJpYXQiOjE1MTYyMzkwMjJ9.fake-signature'
  const authHeader = `Bearer ${invalidToken}`

  await expect(async () => {
    await authService.checkDriver(authHeader)
  }).rejects.toThrow()
})

test('Check Driver Throws Unauthorized on User Not Found in Driver', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginAdmin(annaCreds)
  const validToken = authResult?.accessToken;
  const decoded = jwt.decode(validToken!) as unknown as { id: string };
  const authHeader = `Bearer ${validToken}`

  await expect(async () => {
    await authService.checkDriver(authHeader)
  }).rejects.toThrow()
})

test('Check Enforcer Resolves User ID on Valid JWT', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginEnforcer(mollyCreds)
  const validToken = authResult?.accessToken;
  const decoded = jwt.decode(validToken!) as unknown as { id: string };
  let enforcerId = decoded.id;
  const authHeader = `Bearer ${validToken}`

  const result = await authService.checkEnforcer(authHeader)
  expect(result).toEqual({ id: enforcerId, role: 'enforcer' })
})

test('Check Enforcer Rejects No Provided Auth Header', async () => {
  const authService = new AuthService()

  await expect(async () => {
    await authService.checkEnforcer(undefined)
  }).rejects.toThrow('Unauthorized')
})

test('Check Enforcer Rejects On Failed JWT Verification', async () => {
  const authService = new AuthService()
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZha2UtaWQiLCJpYXQiOjE1MTYyMzkwMjJ9.fake-signature'
  const authHeader = `Bearer ${invalidToken}`

  await expect(async () => {
    await authService.checkEnforcer(authHeader)
  }).rejects.toThrow()
})

test('Check Enforcer Throws Unauthorized on User Not Found in Enforcer', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginAdmin(annaCreds)
  const validToken = authResult?.accessToken;
  const decoded = jwt.decode(validToken!) as unknown as { id: string };
  const authHeader = `Bearer ${validToken}`

  await expect(async () => {
    await authService.checkEnforcer(authHeader)
  }).rejects.toThrow()
})

test('Check Enforcer Resolves User ID on Bypass JWT', async () => {
  const authService = new AuthService()
  const authHeader = `Bearer 1`

  const result = await authService.checkEnforcer(authHeader)
  expect(result).toEqual({ id: '11111111-1111-1111-1111-111111111111', role: 'enforcer' })
})

test('Check Admin Resolves User ID on Valid JWT', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginAdmin(annaCreds)
  const validToken = authResult?.accessToken;
  const decoded = jwt.decode(validToken!) as unknown as { id: string };
  let adminId = decoded.id;
  const authHeader = `Bearer ${validToken}`

  const result = await authService.checkAdmin(authHeader)
  expect(result).toEqual({ id: adminId, role: 'admin' })
})

test('Check Admin Rejects No Provided Auth Header', async () => {
  const authService = new AuthService()
  await expect(async () => {
    await authService.checkAdmin(undefined)
  }).rejects.toThrow('Unauthorized')
})

test('Check Admin Rejects On Failed JWT Verification', async () => {
  const authService = new AuthService()
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZha2UtaWQiLCJpYXQiOjE1MTYyMzkwMjJ9.fake-signature'
  const authHeader = `Bearer ${invalidToken}`

  await expect(async () => {
    await authService.checkAdmin(authHeader)
  }).rejects.toThrow()
})

test('Check Admin Throws Unauthorized on User Not Found in Admin', async () => {
  const authService = new AuthService()
  const authResult = await authService.loginDriver(tommyCreds)
  const validToken = authResult?.accessToken;
  const decoded = jwt.decode(validToken!) as unknown as { id: string };
  const authHeader = `Bearer ${validToken}`

  await expect(async () => {
    await authService.checkAdmin(authHeader)
  }).rejects.toThrow()
})
