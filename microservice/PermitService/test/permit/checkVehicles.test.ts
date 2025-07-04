import {it, beforeAll, afterAll, expect, beforeEach, vi, afterEach} from 'vitest';
import * as http from 'http'
import supertest from 'supertest'
import {setupServer} from 'msw/node'
import { HttpResponse, http as mswhttp } from 'msw'
import * as db from '../db'
import { app, bootstrap } from '../../src/app'

const mockServer = setupServer(
  mswhttp.get('http://localhost:3010/api/v0/checkDriver', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth === '1') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        role: 'driver'
      });
    } else if (auth === '2') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-cccccccccccc',
        role: 'driver'
      });
    } else if (auth === '3') {
      return HttpResponse.error();
    }

    return new HttpResponse(null, { status: 401 });
  }),
);

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

beforeAll( async () => {
  mockServer.listen()
  server = http.createServer(app)
  server.listen()
  await db.reset()
})

afterAll( async () => {
  await db.clean()
  db.shutdown()
  server.close()
  mockServer.close()
})

beforeEach( async () => {
  mockServer.resetHandlers()
  await db.reset()
  await bootstrap();
})

afterEach(() => {
  vi.useRealTimers(); // <-- restore real timers after each test
});

it('Check Permitted Vehicles', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));

  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
        PermittedVehicles {
          vehicle
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data).toBeDefined()
      expect(res.body.data.PermittedVehicles).toBeDefined()
      expect(res.body.data.PermittedVehicles.length).toBe(1)
    })
})

it('No Registered Vehicle', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));

  await supertest(server)
    .post('/graphql')
    .set('Authorization', `2`)
    .send({
      query: `query {
        PermittedVehicles {
          vehicle
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull
    })
})

it('Auth Server Error', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));

  await supertest(server)
    .post('/graphql')
    .set('Authorization', `3`)
    .send({
      query: `query {
        PermittedVehicles {
          vehicle
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull
    })
})