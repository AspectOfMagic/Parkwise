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

it('Update Type Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  UpdatePrice(id: "11111111-1111-1111-1111-111111111111", price: 502.12) {
    id
    classname
    type
    price
  }
}`,
    })
    .then((res) => {
      expect(res.body.data.UpdatePrice).toBeDefined();
      expect(res.body.data.UpdatePrice.id).toBeDefined();
      expect(res.body.data.UpdatePrice.classname).toBe("A");
      expect(res.body.data.UpdatePrice.type).toBe("annual");
      expect(res.body.data.UpdatePrice.price).toBe(502.12);
    });
})

it('Double Update Type Success', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  UpdatePrice(id: "11111111-1111-1111-1111-111111111111", price: 502.12) {
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
  UpdatePrice(id: "11111111-1111-1111-1111-111111111111", price: 900.22) {
    id
    classname
    type
    price
  }
}`,
    })
    .then((res) => {
      expect(res.body.data.UpdatePrice).toBeDefined();
      expect(res.body.data.UpdatePrice.id).toBeDefined();
      expect(res.body.data.UpdatePrice.classname).toBe("A");
      expect(res.body.data.UpdatePrice.type).toBe("annual");
      expect(res.body.data.UpdatePrice.price).toBe(900.22);
    });
})

it('Update Deleted Type Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  UpdatePrice(id: "33333333-3333-3333-3333-333333333331", price: 900.22) {
    id
    classname
    type
    price
  }
}`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.data).toBeNull();
    });
})

it('Update non-existent Type Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  UpdatePrice(id: "33333333-3333-3333-3333-333333333333", price: 900.22) {
    id
    classname
    type
    price
  }
}`,
    })
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.data).toBeNull();
    });
})
