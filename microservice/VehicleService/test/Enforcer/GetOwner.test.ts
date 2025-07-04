import { it, beforeAll, afterAll, expect, beforeEach } from 'vitest';
import * as http from 'http';
import supertest from 'supertest';
import { setupServer } from 'msw/node';
import { HttpResponse, http as mswhttp } from 'msw';

import * as db from '../db';
import { app, bootstrap } from '../../src/app';

const mockServer = setupServer(
  mswhttp.get('http://localhost:3010/api/v0/checkDriver', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth === 'Bearer 2') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        role: 'driver',
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  mswhttp.get('http://localhost:3010/api/v0/checkEnforcer', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth === '1') {
      return HttpResponse.json({
        id: 'enforcer-id',
        role: 'enforcer',
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  mswhttp.get('http://localhost:3010/api/v0/getDriver/:ownerId', ({ params }) => {
    const { ownerId } = params;
    if (ownerId === '33333333-3333-3333-3333-333333333333') {
      return HttpResponse.json({
        name: 'John Doe',
        email: 'john@example.com',
      });
    }
    return new HttpResponse(null, { status: 404 });
  })
);

let server: http.Server;

beforeAll(async () => {
  mockServer.listen();
  server = http.createServer(app);
  server.listen();
  await db.reset();
});

afterAll(() => {
  db.shutdown();
  server.close();
  mockServer.close();
});

beforeEach(async () => {
  mockServer.resetHandlers();
  await db.reset();
  await bootstrap();
})

it('returns the owner info for a given vehicle ID', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1') // enforcer token
    .send({
      query: `
        query {
          GetOwner(vehicleID: "1fffffff-ffff-ffff-ffff-ffffffffffff") {
            id
            name
            email
          }
        }
      `,
    }).then((res) => {
      expect(res.body.data.GetOwner).toEqual({
        id: '33333333-3333-3333-3333-333333333333',
        name: 'John Doe',
        email: 'john@example.com',
      })
    });
});

it('returns an error if vehicle not found', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `
        query {
          GetOwner(vehicleID: "2fffffff-ffff-ffff-ffff-ffffffffffff") {
            id
            name
            email
          }
        }
      `,
    }).then((res) => {
      expect(res.body.errors[0].message).toContain('Vehicle not found');
    })
});

it('returns an error if driver fetch fails', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `
        query {
          GetOwner(vehicleID: "3fffffff-ffff-ffff-ffff-ffffffffffff") {
            id
            name
            email
          }
        }
      `,
    }).then((res) => {
      expect(res.body.errors[0].message).toContain('Error fetching driver information');
    })
})
