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
      query: `mutation {
  CreatePermitType(classname: "C", type: "annual", price: 515.95) {
    id
    classname
    type
    price
  }
}`,
    })
    .then((res) => {
      expect(res.body.data.CreatePermitType).toBeDefined();
      expect(res.body.data.CreatePermitType.id).toBeDefined();
      expect(res.body.data.CreatePermitType.classname).toBe("C");
      expect(res.body.data.CreatePermitType.type).toBe("annual");
      expect(res.body.data.CreatePermitType.price).toBe(515.95);
    });
})

it('2 Same Permit Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  CreatePermitType(classname: "C", type: "annual", price: 515.95) {
    id
    classname
    type
    price
  }
}`,
    })
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  CreatePermitType(classname: "C", type: "annual", price: 515.95) {
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

it('Update Old Permit Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  CreatePermitType(classname: "R", type: "test", price: 932.12) {
    id
    classname
    type
    price
  }
}`,
    })
    .then((res) => {
      expect(res.body.data.CreatePermitType).toBeDefined();
      expect(res.body.data.CreatePermitType.id).toBeDefined();
      expect(res.body.data.CreatePermitType.classname).toBe("R");
      expect(res.body.data.CreatePermitType.type).toBe("test");
      expect(res.body.data.CreatePermitType.price).toBe(932.12);
    });
})


it('New Permit Missing Arg Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  CreatePermitType(className: "C", price: "515.95") {
    id
    className
    type
    price
  }
}`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.data).toBeUndefined();
    });
})

it('Bad Auth Error', async () => {
  await supertest(server)
  .post('/graphql')
  .send({
    query: `mutation {
  CreatePermitType(className: "C", type: "annual", price: "515.95") {
    id
    className
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
