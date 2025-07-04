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
      query: `query {
      ConfirmMyVehicle(plate: "CDE-ABZ" state: CA) {
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

it('Get Valid Vehicle Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
      ConfirmMyVehicle(plate: "ABC124" state: CA) {
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
      expect(res.body.data.ConfirmMyVehicle).toBeDefined();
      expect(res.body.data.ConfirmMyVehicle.make).toBe("Mitsubishi");
      expect(res.body.data.ConfirmMyVehicle.model).toBe("Lancer");
      expect(res.body.data.ConfirmMyVehicle.plate).toBe("ABC124");
      expect(res.body.data.ConfirmMyVehicle.year).toBe(2012);
      expect(res.body.data.ConfirmMyVehicle.color).toBe("Black");
      expect(res.body.data.ConfirmMyVehicle.state).toBe("CA");
    });
})


it('Get Deleted Car Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
      ConfirmMyVehicle(plate: "ABC125" state: CA) {
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
      expect(res.body.errors[0].message).toBe('Error: No Vehicle Found')
      expect(res.body.data).toBeNull()
    });
})

it('Get Vehicle not owned Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
      ConfirmMyVehicle(plate: "LMN456" state: NY) {
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
      expect(res.body.errors[0].message).toBe('Error: No Vehicle Found')
      expect(res.body.data).toBeNull()
    });
})

it('Get Vehicle Invalid Plate State Combo', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
      ConfirmMyVehicle(plate: "ABC124" state: NY) {
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
      expect(res.body.errors[0].message).toBe('Error: No Vehicle Found')
      expect(res.body.data).toBeNull()
    });
})

it('Get Vehicle Missing Arg', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `query {
      ConfirmMyVehicle(plate: "ABC124") {
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
