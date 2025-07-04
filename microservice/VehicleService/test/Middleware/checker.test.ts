import { it, expect, vi } from 'vitest';
import { expressAuthChecker } from '../../src/middleware/checker';
import { afterEach } from 'node:test';

afterEach( async() => {
  vi.restoreAllMocks();
})

it('returns false when roles array is empty', async () => {
  const result = await expressAuthChecker(
    {
      root: {},
      args: {},
      context: { headers: { authorization: '1' } },
      info: {} as any,
    },
    [] // no roles
  );

  expect(result).toBe(false);
});

it('returns false and hits catch block on fetch error', async () => {
  global.fetch = vi.fn(() => {
    throw new Error('Network failure');
  }) as any;

  const result = await expressAuthChecker(
    {
      root: {},
      args: {},
      context: { headers: { authorization: '1' } },
      info: {} as any,
    },
    ['driver']
  );

  expect(result).toBe(false);
});

it('returns true when driver role is validated with 200 status and data', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ id: 'driver-1', role: 'driver' }),
    })
  ) as any;

  const context: any = { headers: { authorization: 'token' } };

  const result = await expressAuthChecker(
    {
      root: {},
      args: {},
      context,
      info: {} as any,
    },
    ['driver']
  );

  expect(result).toBe(true);
  expect(context.user).toEqual({ id: 'driver-1', role: 'driver' });
});

it('returns false when driver check response is not 200', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 401,
    })
  ) as any;

  const result = await expressAuthChecker(
    {
      root: {},
      args: {},
      context: { headers: { authorization: 'bad-token' } },
      info: {} as any,
    },
    ['driver']
  );

  expect(result).toBe(false);
});

it('returns true when enforcer role is validated with 200 status and data', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ id: 'enforcer-1', role: 'enforcer' }),
    })
  ) as any;

  const context: any = { headers: { authorization: 'token' } };

  const result = await expressAuthChecker(
    {
      root: {},
      args: {},
      context,
      info: {} as any,
    },
    ['enforcer']
  );

  expect(result).toBe(true);
  expect(context.user).toEqual({ id: 'enforcer-1', role: 'enforcer' });
});

it('returns false when enforcer check response is not 200', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 403,
    })
  ) as any;

  const result = await expressAuthChecker(
    {
      root: {},
      args: {},
      context: { headers: { authorization: 'bad-token' } },
      info: {} as any,
    },
    ['enforcer']
  );

  expect(result).toBe(false);
});

it('returns true when admin role is validated with 200 status and data', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ id: 'admin-1', role: 'admin' }),
    })
  ) as any;

  const context: any = { headers: { authorization: 'token' } };

  const result = await expressAuthChecker(
    {
      root: {},
      args: {},
      context,
      info: {} as any,
    },
    ['admin']
  );

  expect(result).toBe(true);
  expect(context.user).toEqual({ id: 'admin-1', role: 'admin' });
});

it('returns false when admin check response is not 200', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 403,
    })
  ) as any;

  const result = await expressAuthChecker(
    {
      root: {},
      args: {},
      context: { headers: { authorization: 'invalid-token' } },
      info: {} as any,
    },
    ['admin']
  );

  expect(result).toBe(false);
});
