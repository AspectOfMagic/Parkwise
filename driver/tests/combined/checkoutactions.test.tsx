import { describe, it, vi, expect, beforeEach, afterEach, Mock } from 'vitest';


// Re-import SetCheckout dynamically to allow mocks
let SetCheckout: typeof import('@/app/[locale]/permit/checkout/action').SetCheckout;

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

beforeEach(async () => {
  vi.resetModules(); // Reset module cache before each test

  const fakeCookies = new Map([
    ['permit', { value: 'mock-permit-id' }],
    ['session', { value: 'mock-token' }],
  ]);

  const mockCookieStore = {
    get: (key: string) => fakeCookies.get(key),
  };

  const { cookies } = await import('next/headers');
  (cookies as unknown as Mock).mockReturnValue(mockCookieStore);

  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({
      data: {
        GetPermitTypeByID: {
          id: 'mock-permit-id',
          classname: 'Premium',
          type: 'Resident',
          price: 42.5,
        },
      },
    }),
  });

  SetCheckout = (await import('@/app/[locale]/permit/checkout/action')).SetCheckout;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SetCheckout', () => {
  it('fetches permit data and returns the price', async () => {
    const result = await SetCheckout();
    expect(result).toBe(42.5);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4002/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    );
  });
});
