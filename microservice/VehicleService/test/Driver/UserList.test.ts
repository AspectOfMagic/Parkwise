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
    if (auth === '3') {
      return HttpResponse.json({
        id: '43333333-3333-3333-3333-333333333333',
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

it('Get No Vehicles', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `3`)
    .send({
      query: `query {
        GetMyVehicles {
          id
          plate
          make
          model
          year
          color
          state
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors[0].message).toBe('Error: User has no registered vehicles')
      expect(res.body.data).toBeNull()
    });
})

it('Get 3 Vehicles', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
        GetMyVehicles {
          id
          plate
          make
          model
          year
          color
          state
        }
      }`,
    })
    .then((res) => {
      console.log(res.body)
      expect(res.body.data.GetMyVehicles).toHaveLength(3);
      expect(res.body.data.GetMyVehicles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            make: "Toyota",
            model: "Corolla",
            plate: "ABC123",
            year: 2010,
            color: "Silver",
            state: "CA",
            id: expect.any(String)
          }),
          expect.objectContaining({
            make: "Mitsubishi",
            model: "Lancer",
            plate: "ABC124",
            year: 2012,
            color: "Black",
            state: "CA",
            id: expect.any(String)
          }),
          expect.objectContaining({
            make: "Chevrolet",
            model: "Impala",
            plate: "CHEVY9",
            year: 2011,
            color: "Green",
            state: "CA",
            id: expect.any(String)
          })
        ])
      );
    });
});

