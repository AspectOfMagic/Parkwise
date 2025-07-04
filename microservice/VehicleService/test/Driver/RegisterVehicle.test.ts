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

it('Register Vehicle Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
        RegisterVehicle(
          plate: "ABC1234"
          make: "Toyota"
          model: "Camry"
          year: 2020
          color: "Blue"
          state: CA
        ) {
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
      expect(res.body.data.RegisterVehicle).toBeDefined();
      expect(res.body.data.RegisterVehicle.id).toBeDefined();
      expect(res.body.data.RegisterVehicle.plate).toBe("ABC1234");
      expect(res.body.data.RegisterVehicle.make).toBe("Toyota");
      expect(res.body.data.RegisterVehicle.model).toBe("Camry");
      expect(res.body.data.RegisterVehicle.year).toBe(2020);
      expect(res.body.data.RegisterVehicle.color).toBe("Blue");
      expect(res.body.data.RegisterVehicle.state).toBe("CA");
    });
})

it('Register 2 Vehicle Diff State Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
        RegisterVehicle(
          plate: "ABC1234"
          make: "Toyota"
          model: "Camry"
          year: 2020
          color: "Blue"
          state: CA
        ) {
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

  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
        RegisterVehicle(
          plate: "ABC1234"
          make: "Toyota"
          model: "Camry"
          year: 2020
          color: "Blue"
          state: NC
        ) {
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
      expect(res.body.data.RegisterVehicle).toBeDefined();
      expect(res.body.data.RegisterVehicle.id).toBeDefined();
      expect(res.body.data.RegisterVehicle.plate).toBe("ABC1234");
      expect(res.body.data.RegisterVehicle.make).toBe("Toyota");
      expect(res.body.data.RegisterVehicle.model).toBe("Camry");
      expect(res.body.data.RegisterVehicle.year).toBe(2020);
      expect(res.body.data.RegisterVehicle.color).toBe("Blue");
      expect(res.body.data.RegisterVehicle.state).toBe("NC");
    });
})

it('Register 2 Vehicle Same User Same plate & State Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
        RegisterVehicle(
          plate: "ABC1234"
          make: "Toyota"
          model: "Camry"
          year: 2020
          color: "Blue"
          state: CA
        ) {
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

  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
        RegisterVehicle(
          plate: "ABC1234"
          make: "Toyota"
          model: "Camry"
          year: 2020
          color: "Blue"
          state: CA
        ) {
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
      expect(res.body.errors[0].message).toBe("Error: Invalid Vehicle")
      expect(res.body.data).toBeNull();
    })
})

it('Missing Arg error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
        RegisterVehicle(
          plate: "ABC1234"
          make: "Toyota"
          model: "Camry"
          color: "Blue"
          state: CA
        ) {
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
      expect(res.body.data).toBeUndefined();
    })
})

it('Make on Deleted Plate, Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
        RegisterVehicle(
          plate: "TESLA1"
          make: "Toyota"
          model: "Tacoma"
          year: 2010
          color: "Red"
          state: TX
        ) {
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
      expect(res.body.data.RegisterVehicle).toBeDefined();
      expect(res.body.data.RegisterVehicle.id).toBeDefined();
      expect(res.body.data.RegisterVehicle.plate).toBe("TESLA1");
      expect(res.body.data.RegisterVehicle.make).toBe("Toyota");
      expect(res.body.data.RegisterVehicle.model).toBe("Tacoma");
      expect(res.body.data.RegisterVehicle.year).toBe(2010);
      expect(res.body.data.RegisterVehicle.color).toBe("Red");
      expect(res.body.data.RegisterVehicle.state).toBe("TX");
    });
  
})
