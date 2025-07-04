import { it, expect, vi } from 'vitest';
import { expressAuthChecker } from '../../src/middleware/checker';
import { afterEach } from 'node:test';

afterEach( async () => {
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