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
  DeleteType(id: "11111111-1111-1111-1111-111111111111") {
    id
    classname
    type
    price
  }
}`,
    })
    .then((res) => {
      expect(res.body.data.DeleteType).toBeDefined();
      expect(res.body.data.DeleteType.id).toBeDefined();
      expect(res.body.data.DeleteType.classname).toBe("A");
      expect(res.body.data.DeleteType.type).toBe("annual");
      expect(res.body.data.DeleteType.price).toBe(765.12);
    });
})

it('2 Same Permit Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  DeleteType(id: "11111111-1111-1111-1111-111111111111") {
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
  DeleteType(id: "11111111-1111-1111-1111-111111111111") {
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

it('Already Deleted Permit Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  DeleteType(id: "33333333-3333-3333-3333-333333333331") {
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

it('Non-Existent Permit Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  DeleteType(id: "33333333-3333-3333-3333-333333333333") {
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

it('Delete Permit Missing Arg Error', async () => {
  await supertest(server)
    .post('/graphql')
    .set('Authorization', `1`)
    .send({
      query: `mutation {
  DeleteType {
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
  DeleteType(className: "C", type: "annual", price: "515.95") {
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
