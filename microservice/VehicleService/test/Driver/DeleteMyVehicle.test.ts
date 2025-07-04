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
    .set('Authorization', `2`)
    .send({
      query: `mutation {
      DeleteMyVehicle(plate: "CDE-ABZ" state: CA) {
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
})

it('Delete Valid Plate Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
      DeleteMyVehicle(plate: "ABC124" state: CA) {
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
      expect(res.body.data.DeleteMyVehicle).toBeDefined();
      expect(res.body.data.DeleteMyVehicle.make).toBe("Mitsubishi");
      expect(res.body.data.DeleteMyVehicle.model).toBe("Lancer");
      expect(res.body.data.DeleteMyVehicle.plate).toBe("ABC124");
      expect(res.body.data.DeleteMyVehicle.year).toBe(2012);
      expect(res.body.data.DeleteMyVehicle.color).toBe("Black");
      expect(res.body.data.DeleteMyVehicle.state).toBe("CA");
    });
})


it('Delete Deleted Car error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
      DeleteMyVehicle(plate: "ABC125" state: CA) {
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
      expect(res.body.errors[0].message).toBe('Error: Vehicle not found or already deleted')
      expect(res.body.data).toBeNull()
    });
})

it('Delete Plate not owned Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
      DeleteMyVehicle(plate: "LMN456" state: NY) {
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
      expect(res.body.errors[0].message).toBe('Error: Vehicle not found or already deleted')
      expect(res.body.data).toBeNull()
    });
})

it('Delete Plate Invalid Plate State Combo', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
      DeleteMyVehicle(plate: "ABC124" state: NY) {
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
      expect(res.body.errors[0].message).toBe('Error: Vehicle not found or already deleted')
      expect(res.body.data).toBeNull()
    });
})

it('Delete Plate Missing Arg', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
      DeleteMyVehicle(plate: "ABC124") {
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
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeUndefined()
    });
})
