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
    } else if (auth === '2') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb',
        role: 'driver'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  mswhttp.get('http://localhost:3010/api/v0/getDriver/:holder', ({ params }) => {
    const holder = params.holder;
    if (holder === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') {
      return HttpResponse.json({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Tommy',
        email: 'tommy@books.com'
      });
    } else {
      return new HttpResponse(null, { status: 404 });
    }
  }),

  mswhttp.post('http://localhost:4000/graphql', async ({ request }) => {
    const body = (await request.json()) as { variables: any };
    const vars = body?.variables
    const plate = vars.plate
    const state = vars.state

    if (plate === "2" && state === "3") {
      return HttpResponse.json({
        data: {
          ConfirmMyVehicle: {
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
          }
        }
      })
    } else if (plate === "4" && state === "5") {
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

it('New Permit Status True Success', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '2')
    .set('state', '3')
    .send({
      query: `mutation {
    CreatePermit(
      type: "11111111-1111-1111-1111-111111111114", start: "2026-05-22T00:00:00.000Z"
    ) {
      id
      holder
      vehicle
      active
      expiration
      status
      info {
        id
        classname
        type
        price
      }
    }
}`,
    })
    .then((res) => {
      expect(res.body.data.CreatePermit).toBeDefined()
      expect(res.body.data.CreatePermit.id).toBeDefined()
      expect(res.body.data.CreatePermit.holder).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      expect(res.body.data.CreatePermit.vehicle).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
      expect(res.body.data.CreatePermit.active).toBe('2026-05-22T00:00:00.000Z')
      expect(res.body.data.CreatePermit.expiration).toBe('2026-05-22T23:59:00.000Z')
      expect(res.body.data.CreatePermit.status).toBe(true)
      expect(res.body.data.CreatePermit.info).toEqual({
        id: '11111111-1111-1111-1111-111111111114',
        classname:  'A',
        type: 'day',
        price: 5.25
      })
  })
})

it('New Permit Status False Success', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '2')
    .set('state', '3')
    .send({
      query: `mutation {
    CreatePermit(type: "11111111-1111-1111-1111-111111111114", start: "2026-05-23T00:00:00.000Z") {
    id
    holder
    vehicle
    active
    expiration
    status
    info {
      id
      classname
      type
      price
    }
    }
}`,
    })
    .then((res) => {
      expect(res.body.data.CreatePermit).toBeDefined()
      expect(res.body.data.CreatePermit.id).toBeDefined()
      expect(res.body.data.CreatePermit.status).toBe(false)
  })
})

it('Overlapping Permits Failure', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '2')
    .set('state', '3')
    .send({
      query: `mutation {
    CreatePermit(type: "11111111-1111-1111-1111-111111111114", start: "2026-05-22T00:00:00.000Z") {
    id
    holder
    vehicle
    active
    expiration
    status
    info {
      id
      classname
      type
      price
    }
    }
    }`,
    })

  await supertest(server)
  .post('/graphql')
  .set('Authorization', `1`)
  .set('plate', '2')
  .set('state', '3')
  .send({
    query: `mutation {
  CreatePermit(type: "11111111-1111-1111-1111-111111111114", start: "2026-05-22T14:28:30.123Z") {
  id
  holder
  vehicle
  active
  expiration
  status
  info {
    id
    classname
    type
    price
  }
  }
}`,
  })
  .then((res) => {
    expect(res.body.errors).toBeDefined()
    expect(res.body.data).toBeNull()
})
})

it('New Permit Invalid Driver', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `2`)
    .set('plate', '2')
    .set('state', '3')
    .send({
      query: `mutation {
    CreatePermit(
      type: "11111111-1111-1111-1111-111111111114", start: "2026-05-22T00:00:00.000Z"
    ) {
      id
      holder
      vehicle
      active
      expiration
      status
      info {
        id
        classname
        type
        price
      }
    }
}`,
  })
  .then((res) => {
    expect(res.body.errors).toBeDefined()
    expect(res.body.data).toBeNull()
  })
})

it('Unfound Liscence', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
    CreatePermit(
      type: "11111111-1111-1111-1111-111111111114", start: "2026-05-22T00:00:00.000Z"
    ) {
      id
      holder
      vehicle
      active
      expiration
      status
      info {
        id
        classname
        type
        price
      }
    }
}`,
  })
  .then((res) => {
    expect(res.body.errors).toBeDefined()
    expect(res.body.data).toBeNull()
  })
})

it('Invalid Plate', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '3')
    .set('state', '4')
    .send({
      query: `mutation {
    CreatePermit(
      type: "11111111-1111-1111-1111-111111111114", start: "2026-05-22T00:00:00.000Z"
    ) {
      id
      holder
      vehicle
      active
      expiration
      status
      info {
        id
        classname
        type
        price
      }
    }
}`,
  })
  .then((res) => {
    expect(res.body.errors).toBeDefined()
    expect(res.body.data).toBeNull()
  })
})

it('Invalid Plate', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-22T14:28:30.123Z'));
  
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .set('plate', '4')
    .set('state', '5')
    .send({
      query: `mutation {
    CreatePermit(
      type: "11111111-1111-1111-1111-111111111114", start: "2026-05-22T00:00:00.000Z"
    ) {
      id
      holder
      vehicle
      active
      expiration
      status
      info {
        id
        classname
        type
        price
      }
    }
}`,
  })
  .then((res) => {
    expect(res.body.errors).toBeDefined()
    expect(res.body.data).toBeNull()
  })
})