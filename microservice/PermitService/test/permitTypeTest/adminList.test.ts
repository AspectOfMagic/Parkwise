import {it, beforeAll, afterAll, expect, beforeEach} from 'vitest';
import * as http from 'http'
import supertest from 'supertest'
import {setupServer} from 'msw/node'
import { HttpResponse, http as mswhttp } from 'msw'

import * as db from '../db'
import { app, bootstrap } from '../../src/app'

const mockServer = setupServer(
  mswhttp.get('http://localhost:3010/api/v0/checkAdmin', ({ request }) => {
    const auth = request.headers.get('authorization');

    if (auth === '1') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
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

it('New Permit Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
        GetPermitIDs {
           id
          classname
          type
          price
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data.GetPermitIDs).toBeDefined
      expect(res.body.data.GetPermitIDs.length).toBe(8)
      expect(res.body.data.GetPermitIDs[0]).toHaveProperty('id')
      expect(res.body.data.GetPermitIDs[0]).toHaveProperty('classname')
      expect(res.body.data.GetPermitIDs[0]).toHaveProperty('type')
      expect(res.body.data.GetPermitIDs[0]).toHaveProperty('price')
      expect(res.body.data.GetPermitIDs[1].classname).toBe('A')
      expect(res.body.data.GetPermitIDs[1].type).toBe('month')
      expect(res.body.data.GetPermitIDs[1].price).toBe(150)
      expect(res.body.data.GetPermitIDs[7].classname).toBe('R')
      expect(res.body.data.GetPermitIDs[7].type).toBe('day')
      expect(res.body.data.GetPermitIDs[7].price).toBe(6)
    });
})

it('Invalid Admin', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `2`)
    .send({
      query: `query {
        GetPermitIDs {
           id
          classname
          type
          price
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull
    });
})
