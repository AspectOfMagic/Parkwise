import {it, beforeAll, afterAll, expect, beforeEach, vi, afterEach} from 'vitest';
import * as http from 'http'
import supertest from 'supertest'
import {setupServer} from 'msw/node'
import { HttpResponse, http as mswhttp } from 'msw'
import * as db from '../db'
import { app, bootstrap } from '../../src/app'

const mockServer = setupServer(
  mswhttp.get('http://localhost:3010/api/v0/checkEnforcer', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth === '1') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        role: 'enforcer'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  mswhttp.post('http://localhost:4000/graphql', async ({ request }) => {
    const body = (await request.json()) as { variables: any };
    const vars = body?.variables
    const plate = vars.plate
    const state = vars.state

    if (plate === "2" && state === "3") {
      return HttpResponse.json({
        data: {
          GetByPlate: {
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
          }
        }
      })
    } else if (plate === "4" && state === "5") {
      return HttpResponse.json({
        data: {
          GetByPlate: {
            id: 'invalid'
          }
        }
      })
    } else if (plate === "5" && state === "6") {
      return HttpResponse.error();
    }

    return new HttpResponse(null, { status: 404 });
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

afterEach(() => {
  vi.useRealTimers(); // <-- restore real timers after each test
});

it('Check Valid Permit: returns true', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '2')
    .set('state', '3')
    .send({
      query: `
        query {
          CheckByVehicle {
            valid
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.data).toBeDefined()
      expect(res.body.data.CheckByVehicle).toBeDefined()
      expect(res.body.data.CheckByVehicle.valid).toBe(true)
  })
})

it('Check InValid Old Permit: returns false', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-22T14:28:30.123Z'));

  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '2')
    .set('state', '3')
    .send({
      query: `
        query {
          CheckByVehicle {
            valid
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.data).toBeDefined()
      expect(res.body.data.CheckByVehicle).toBeDefined()
      expect(res.body.data.CheckByVehicle.valid).toBe(false)
  })
})


it('Check InValid Future Permit: returns false', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-22T14:28:30.123Z'));

  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '2')
    .set('state', '3')
    .send({
      query: `
        query {
          CheckByVehicle {
            valid
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.data).toBeDefined()
      expect(res.body.data.CheckByVehicle).toBeDefined()
      expect(res.body.data.CheckByVehicle.valid).toBe(false)
  })
})

it('Invalid License', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '3')
    .set('state', '4')
    .send({
      query: `
        query {
          CheckByVehicle {
            valid
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.data).toBeDefined()
      expect(res.body.data.CheckByVehicle).toBeDefined()
      expect(res.body.data.CheckByVehicle.valid).toBe(false)
  })
})

it('Unfound License', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `
        query {
          CheckByVehicle {
            valid
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull
  })
})

it('Unfound Vid', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '4')
    .set('state', '5')
    .send({
      query: `
        query {
          CheckByVehicle {
            valid
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull
  })
})

it('Invalid Enforcer', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `2`)
    .set('plate', '1')
    .set('state', '2')
    .send({
      query: `
        query {
          CheckByVehicle {
            valid
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull
  })
})

it('Vehicle Server Error', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '5')
    .set('state', '6')
    .send({
      query: `
        query {
          CheckByVehicle {
            valid
          }
        }
      `,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined()
      expect(res.body.data).toBeNull
  })
})