import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (key: string) => {
      const fakeCookies: Record<string, { value: string }> = {
        session: { value: 'mock-token' },
        plate: { value: 'XYZ123' },
        state: { value: 'CA' },
        permit: { value: 'permit-type-id' },
      };
      return fakeCookies[key];
    },
  }),
}));

import { CreatePermit } from '@/app/[locale]/permit/success/action';

describe('CreatePermit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when mutation succeeds', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => ({
        data: {
          CreatePermit: {
            id: '1',
            holder: 'test',
            active: true,
          },
        },
      }),
    });

    const result = await CreatePermit();
    expect(result).toBe(true);
  });

  it('returns false when GraphQL errors exist', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => ({
        errors: [{ message: 'Something went wrong' }],
      }),
    });

    const result = await CreatePermit();
    expect(result).toBe(false);
  });
});

