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

    if (auth === '1') {
      return HttpResponse.json({
        id: '11111111-1111-1111-1111-111111111111',
        role: 'driver'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),
  mswhttp.get('http://localhost:3010/api/v0/getDriver/:holder', ({ params }) => {
    const holder = params.holder;
    if (holder === '11111111-1111-1111-1111-111111111111') {
      return HttpResponse.json({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Tommy',
        email: 'tommy@books.com'
      });
    } else {
      return new HttpResponse(null, { status: 404 });
    }
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

it('Bad Auth', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '2')
    .send({
      query: `mutation {
      payTicket(input: "some-user-id") {
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

it('Pay Ticket Success', async () => {
  await supertest(server)
  .post('/graphql')
  .set('Authorization', '1')
  .send({
    query: `mutation {
      payTicket(input: "aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb") {
        id
        cost
        issued
        deadline
        status
      }
    }`
  })
  .then((res) => {
    expect(res.body.data.payTicket).toBeDefined()
    expect(res.body.data.payTicket.cost).toBe(100)
  })
})
it('Pay Ticket /getDriver failure', async () => {
  mockServer.use(
    mswhttp.get('http://localhost:3010/api/v0/getDriver/:userId', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `mutation {
        payTicket(input: "aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb") {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors[0].message).toBe('Error fetching driver information');
      expect(res.body.data).toBeNull();
    });
});

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
        payTicket(input: "aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb") {
          id
          cost
          issued
          deadline
          status
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data.payTicket).toBeDefined();
    });
});

it('Pay Ticket Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `mutation {
      payTicket(input: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa") {
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
});

