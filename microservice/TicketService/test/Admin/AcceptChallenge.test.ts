import {it, expect, beforeAll, afterAll, beforeEach} from 'vitest';
import * as http from 'http'
import supertest from 'supertest'
import {setupServer} from 'msw/node'
import { HttpResponse, http as mswhttp } from 'msw'

import * as db from '../db'
import { app, bootstrap } from '../../src/app'

const mockServer = setupServer(
  mswhttp.get('http://localhost:3010/api/v0/checkDriver', ({ request }) => {
    const auth = request.headers.get('authorization');

    if (auth === 'Bearer 2') {
      return HttpResponse.json({
        id: '11111111-1111-1111-1111-111111111111',
        role: 'driver'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),
  mswhttp.get('http://localhost:3010/api/v0/checkAdmin', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth === '1') {
      return HttpResponse.json({
        id: '11111111-1111-1111-1111-111111111111',
        role: 'admin'
      });
    }

    return new HttpResponse(null, { status: 401 });
  })
);

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

beforeAll( async () => {
  mockServer.listen()
  server = http.createServer(app)
  server.listen()
  await db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  mockServer.close()
})

beforeEach( async() => {
  mockServer.resetHandlers()
  await db.reset()
  await bootstrap();
})

it('No Auth Error', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation {
      acceptChallenge(input: "some-ticket-id") {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull()
    });
})

it('Bad Auth', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '2')
    .send({
      query: `mutation {
      acceptChallenge(input: "some-ticket-id") {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull()
    })
})

it('Accept Challenge Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `mutation {
      acceptChallenge(input: "ccccdddd-cccc-dddd-cccc-ddddccccdddd") {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data.acceptChallenge).toBeDefined()
      expect(res.body.data.acceptChallenge.cost).toBe(90)
    })
})

it('Accept Challenge Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `mutation {
      acceptChallenge(input: "00000000-0000-0000-0000-000000000000") {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors[0].message).toBe('Ticket not found')
      expect(res.body.data).toBeNull()
    })
})