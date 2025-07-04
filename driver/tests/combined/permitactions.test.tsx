import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPermits } from '@/app/[locale]/permit/action';

const getMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: getMock,
  }),
}));
beforeEach(() => {
  getMock.mockReset();
});
describe('getPermits', () => {
  it('returns null if no session cookie is present', async () => {
  const originalError = console.error;
  console.error = vi.fn();

  getMock.mockReturnValue(undefined);
  const result = await getPermits();
  expect(result).toBeNull();

  console.error = originalError;
  });

  it('returns data if request succeeds without GraphQL errors', async () => {
    getMock.mockReturnValue({ value: 'mock-token' });

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        data: {
          GetPermitTypes: [
            { id: '1', classname: 'Student', type: 'A', price: 100 },
            { id: '2', classname: 'Faculty', type: 'B', price: 200 },
          ]
        }
      }),
    } as Response);

    const result = await getPermits();
    expect(result).toEqual([
      { id: '1', classname: 'Student', type: 'A', price: 100 },
      { id: '2', classname: 'Faculty', type: 'B', price: 200 },
    ]);
  });

  it('returns undefined if GraphQL returns errors', async () => {
    getMock.mockReturnValue({ value: 'mock-token' });

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ errors: [{ message: 'Some error' }] }),
    } as Response);

    const result = await getPermits();
    expect(result).toBeUndefined();
  });
});
