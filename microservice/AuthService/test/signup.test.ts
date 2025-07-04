import { test, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import * as http from 'http'
import * as jwt from 'jsonwebtoken'

import * as db from './db'
import app from '../src/app'
import { AuthService } from '../src/auth/service'

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
})

const testCalumCreds = {
	'name': 'Cozy Calum',
	'email': 'cozycalum@books.com',
	'password': 'cozycalum'
}

const existingTommy = {
	'name': 'Tommy Timekeeper',
	'email': 'tommy@books.com',
	'password': 'tommytimekeeper'
}

test('Signup works for non-existent user', async () => {
	const authService = new AuthService()
	const createdCreds = await authService.createAccount(testCalumCreds)
	expect(createdCreds).toEqual({name: 'Cozy Calum', email: 'cozycalum@books.com', accessToken: createdCreds?.accessToken})
})

test('Signup fails for already existing user', async () => {
	const authService = new AuthService()
	const created = await authService.createAccount(existingTommy)
	expect(created).toBe(undefined)
})
