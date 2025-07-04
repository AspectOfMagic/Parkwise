import { test, expect, beforeAll, afterAll, vi} from 'vitest'
import request from 'supertest'
import * as db from './db'
import app from '../src/app'
import * as http from 'http'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { AuthService } from '../src/auth/service'
dotenv.config()

// Test credentials
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

let server: http.Server
let driverToken: string
let enforcerToken: string
let adminToken: string

beforeAll(async () => {
  // Start the server and reset the database
  server = app.listen()
  await db.reset()
  
  // Get tokens for authenticated tests
  const authService = new AuthService()
  
  const driverAuth = await authService.loginDriver(tommyCreds)
  driverToken = driverAuth?.accessToken || ''
  
  const enforcerAuth = await authService.loginEnforcer(mollyCreds)
  enforcerToken = enforcerAuth?.accessToken || ''
  
  const adminAuth = await authService.loginAdmin(annaCreds)
  adminToken = adminAuth?.accessToken || ''
})

afterAll(() => {
  server.close()
  db.shutdown()
})

test('GET /api/v0/docs should serve Swagger UI', async () => {
  const response = await request(app).get('/api/v0/docs/')
  expect(response.status).toBe(200)
})

test('App accepts JSON data', async () => {
  const response = await request(app)
    .post('/api/v0/login')
    .send(tommyCreds)
    .set('Content-Type', 'application/json')
  
  expect(response.headers['content-type']).toContain('application/json')
})

test('App has CORS headers enabled', async () => {
  const response = await request(app)
    .options('/api/v0/login')
    .set('Origin', 'http://example.com')
  
  expect(response.headers['access-control-allow-origin']).toBeDefined()
})

test('App returns 404 for unknown routes', async () => {
  const response = await request(app).get('/api/v0/nonexistent-route')
  expect(response.status).toBe(404)
})

test('POST /api/v0/login should authenticate driver', async () => {
  const response = await request(app)
    .post('/api/v0/login')
    .send(tommyCreds)
    
  // Verify token is valid
  const token = response.body.accessToken
  const decoded = jwt.decode(token) as { id: string }
  expect(decoded.id).toBeDefined()
})

test('POST /api/v0/login with wrong password should fail', async () => {
  const response = await request(app)
    .post('/api/v0/login')
    .send({
      email: tommyCreds.email,
      password: 'wrongpassword'
    })
  
  expect(response.status).toBe(401)
})

test('GET /api/v0/checkDriver should authenticate driver', async () => {
  const response = await request(app)
    .get('/api/v0/checkDriver')
    .set('Authorization', `Bearer ${driverToken}`)
  
  expect(response.body).toHaveProperty('role', 'driver')
})

test('GET /api/v0/checkEnforcer should authenticate enforcer', async () => {
  const response = await request(app)
    .get('/api/v0/checkEnforcer')
    .set('Authorization', `Bearer ${enforcerToken}`)
  
  expect(response.body).toHaveProperty('role', 'enforcer')
})

test('GET /api/v0/checkAdmin should authenticate admin', async () => {
  const response = await request(app)
    .get('/api/v0/checkAdmin')
    .set('Authorization', `Bearer ${adminToken}`)
  
  expect(response.body).toHaveProperty('role', 'admin')
})

test('GET /api/v0/checkAdmin with driver token should fail', async () => {
  const response = await request(app)
    .get('/api/v0/checkAdmin')
    .set('Authorization', `Bearer ${driverToken}`)
  
  expect(response.status).toBe(401)
})

test('GET /api/v0/checkDriver without token should fail', async () => {
  const response = await request(app)
    .get('/api/v0/checkDriver')
  
  expect(response.status).toBe(401)
})

test('App handles validation errors properly', async () => {
  const response = await request(app)
    .post('/api/v0/login')
    .send({})
  
  expect(response.status).toBe(400)
})

test('App handles malformed JSON', async () => {
  const response = await request(app)
    .post('/api/v0/login')
    .set('Content-Type', 'application/json')
    .send('{"email": "bad json')
  
  expect(response.status).toBe(400)
})

test('App handles unexpected server errors and defaults to 500', async () => {
  const spy = vi
    .spyOn(AuthService.prototype, 'loginDriver')
    .mockImplementation(() => {
      throw new Error('Unexpected failure')
    })
  const response = await request(app)
    .post('/api/v0/login')
    .send({
      email: 'tommy@books.com',
      password: 'tommytimekeeper',
    })
  expect(response.status).toBe(500)
  expect(response.body.message).toBe('Unexpected failure')
  spy.mockRestore()
})
