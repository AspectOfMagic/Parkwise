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

    if (auth === 'Bearer 2') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        role: 'driver'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),
  mswhttp.get('http://localhost:3010/api/v0/checkEnforcer', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth === '1') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        role: 'enforcer'
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

it('GetByPlate No Auth error', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query {
        GetByPlate(plate: "ABC123" state: CA) {
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
      expect(res.body.errors).toBeDefined();
      expect(res.body.data).toBeNull();
    });
});

it('GetByPlate Bad Auth error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `2`)
    .send({
      query: `query {
        GetByPlate(plate: "ABC123" state: CA) {
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
      expect(res.body.errors).toBeDefined();
      expect(res.body.data).toBeNull();
    });
});


it('GetByPlate valid liscence Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `query {
        GetByPlate(plate: "ABC123" state: CA) {
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
      expect(res.body.data.GetByPlate).toBeDefined();
      expect(res.body.data.GetByPlate.id).toBeDefined();
      expect(res.body.data.GetByPlate.plate).toBe("ABC123");
      expect(res.body.data.GetByPlate.make).toBe("Toyota");
      expect(res.body.data.GetByPlate.model).toBe("Corolla");
      expect(res.body.data.GetByPlate.year).toBe(2010);
      expect(res.body.data.GetByPlate.color).toBe("Silver");
      expect(res.body.data.GetByPlate.state).toBe("CA");
    });
});

it('GetByPlate valid liscence Bad State Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', '1')
    .send({
      query: `query {
        GetByPlate(plate: "ABC123" state: NC) {
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
      expect(res.body.errors).toBeDefined();
      expect(res.body.data).toBeNull();
    });
});

it('GetByPlate non-existent liscence Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
        GetByPlate(plate: "TESLA2" state: NC) {
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
      expect(res.body.errors[0].message).toBe('Error: No Vehicle');
      expect(res.body.data).toBeNull();
    });
});

it('GetByPlate Deleted liscence Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
        GetByPlate(plate: "TESLA1" state: NC) {
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
      (res.body.errors)
      expect(res.body.errors[0].message).toBe('Error: No Vehicle');
      expect(res.body.data).toBeNull();
    });
});