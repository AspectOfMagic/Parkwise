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
  await bootstrap()
})

it('GetPermitTypeByID Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `
        query {
          GetPermitTypeByID (
            id: "11111111-1111-1111-1111-111111111114"
          ) {
            id
            classname
            type
            price
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.data.GetPermitTypeByID).toBeDefined
      expect(res.body.data.GetPermitTypeByID.classname).toBe('A')
      expect(res.body.data.GetPermitTypeByID.type).toBe('day')
      expect(res.body.data.GetPermitTypeByID.price).toBe(5.25)
    });
})

it('GetPermitTypeByID Invalid ID', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `
        query {
          GetPermitTypeByID (
            id: "1"
          ) {
            id
            classname
            type
            price
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull
    });
})