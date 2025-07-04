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
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        role: 'driver'
      });
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
  mockServer.close()
  db.shutdown()
  server.close()
})

beforeEach( async () => {
  mockServer.resetHandlers()
  await db.reset()
  await bootstrap();
})

it('List Permits Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
        GetPermitTypes {
          classname
          type
          price
        }
      }`,
    })
    .then((res) => {
      console.log(res.body)
      expect(res.body.data.GetPermitTypes).toBeDefined
      expect(res.body.data.GetPermitTypes.length).toBe(8)
      expect(res.body.data.GetPermitTypes[0]).toHaveProperty('classname')
      expect(res.body.data.GetPermitTypes[0]).toHaveProperty('type')
      expect(res.body.data.GetPermitTypes[0]).toHaveProperty('price')
      expect(res.body.data.GetPermitTypes[1].classname).toBe('A')
      expect(res.body.data.GetPermitTypes[1].type).toBe('month')
      expect(res.body.data.GetPermitTypes[1].price).toBe(150)
      expect(res.body.data.GetPermitTypes[7].classname).toBe('R')
      expect(res.body.data.GetPermitTypes[7].type).toBe('day')
      expect(res.body.data.GetPermitTypes[7].price).toBe(6)
    });
})

it('List Permits without being authenticated', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query {
        GetPermitTypes {
          classname
          type
          price
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined
    });
})
