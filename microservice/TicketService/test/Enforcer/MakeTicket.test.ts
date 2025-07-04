import {beforeAll, afterAll, beforeEach, it, expect} from 'vitest';
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
  mswhttp.get('http://localhost:3010/api/v0/checkEnforcer', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth === '1') {
      return HttpResponse.json({
        id: '11111111-1111-1111-1111-111111111111',
        role: 'enforcer'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),
  mswhttp.post('http://localhost:4000/graphql', ({ request }) => {
    return HttpResponse.json({
      data: {
        GetOwner: {
          id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
          name: 'Tommy',
          email: 'tommy@books.com'
        }
      }
    });
  }),
  mswhttp.post('https://api.mailgun.net/v3/test/messages', () => {
    return HttpResponse.text('OK');
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
      makeTicket(newTicket: {
          vehicle: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          cost: 50
      }) {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.data).toBeNull();
    })
})

it('Bad Auth', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '2')
    .send({
      query: `mutation {
      makeTicket(newTicket: {
          vehicle: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          cost: 50
      }) {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.data).toBeNull();
    })
})

it('Email Failure', async () => {
  mockServer.use(
    mswhttp.post('https://api.mailgun.net/v3/test/messages', () => {
      return new HttpResponse('Internal Server Error', { status: 500 });
    })
  );

  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `mutation {
        makeTicket(newTicket: {
          vehicle: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          cost: 50
        }) {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data.makeTicket).toBeDefined();
      expect(res.body.data.makeTicket.cost).toBe(50);
    })
});

it('Make Ticket Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `mutation {
        makeTicket(newTicket: {
          vehicle: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          cost: 50
        }) {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data.makeTicket).toBeDefined();
      expect(res.body.data.makeTicket.cost).toBe(50);
    })
})
