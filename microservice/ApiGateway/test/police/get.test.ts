import { it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import app from '../../src/app';
import config from '../../src/config';

const validApiKey = Object.keys(config.apiKeys).find(key => config.apiKeys[key].role === 'police');
const invalidPermission = Object.keys(config.apiKeys).find(key => config.apiKeys[key].role === 'registrar');
const invalidApiKey = 'invalid-api-key';

// MSW to mock the GraphQL backend
const server = setupServer(
  http.post(config.graphqlEndpoint, async ({ request }) => {
    const body = await request.json();
    const licensePlate = request.headers.get('plate');
    const state = request.headers.get('state');

    if (body.query.includes('CheckByVehicle')) {
      if (licensePlate === 'ABC123' && state === 'CA') {
        return HttpResponse.json({
          data: {
            CheckByVehicle: {
              valid: true,
              permitType: 'Faculty',
              expirationDate: '2025-12-31'
            }
          }
        });
      }

      if (licensePlate === 'XYZ789') {
        return new HttpResponse(null, { status: 500 });
      }
    }

    return HttpResponse.json({ data: { CheckByVehicle: null } });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('returns 401 if API key is missing', async () => {
  const res = await request(app).get('/api/police/permit');
  expect(res.status).toBe(401);
  expect(res.body.error).toBe('API key is required');
});

it('returns 401 if API key is invalid', async () => {
  const res = await request(app)
    .get('/api/police/permit')
    .set('X-API-Key', invalidApiKey);
  expect(res.status).toBe(401);
  expect(res.body.error).toBe('Invalid API key');
});

it('returns 400 if licensePlate or state is missing', async () => {
  const res = await request(app)
    .get('/api/police/permit')
    .set('X-API-Key', validApiKey);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('License plate and state are required');
});

it('returns permit info for valid request', async () => {
  const res = await request(app)
    .get('/api/police/permit')
    .set('X-API-Key', validApiKey)
    .query({ licensePlate: 'ABC123', state: 'CA' });

  // The test should match what permitService.ts actually returns
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    valid: true,
    permitType: 'Faculty',
    expirationDate: '2025-12-31'
  });
});

it('returns 500 if GraphQL service fails', async () => {
  const res = await request(app)
    .get('/api/police/permit')
    .set('X-API-Key', validApiKey)
    .query({ licensePlate: 'XYZ789', state: 'NY' });

  expect(res.status).toBe(500);
  // Updated to match the actual error message from police.ts route handler
  expect(res.body.error).toBe('Failed to check vehicle permit');
});

it('returns 404 for unknown route', async () => {
  const res = await request(app)
    .get('/api/nonexistent')
    .set('X-API-Key', validApiKey);

  expect(res.status).toBe(404);
  expect(res.body.error).toBe('Endpoint not found');
});

it('returns 403 for Incorrect Role', async () => {
  const res = await request(app)
    .get('/api/police/permit')
    .set('X-API-Key', invalidPermission);

  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Insufficient permissions');
});