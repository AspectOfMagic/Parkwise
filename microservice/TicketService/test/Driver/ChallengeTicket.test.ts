import {it, beforeAll, afterAll, expect, beforeEach} from 'vitest';
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
        id: '11111111-1111-1111-1111-111111111111',
        role: 'driver'
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

it('Bad Auth', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '2')
    .send({
      query: `mutation {
      challengeTicket(input: "some-ticket-id", desc: "test") {
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
});

it('Challenge Ticket Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `mutation {
      challengeTicket(input: "aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb", desc: "test") {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data.challengeTicket).toBeDefined();
      expect(res.body.data.challengeTicket.cost).toBe(100);
    })
})

it('Challenge Ticket Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `mutation {
      challengeTicket(input: "00000000-0000-0000-0000-000000000000", desc: "test") {
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
    });
})

