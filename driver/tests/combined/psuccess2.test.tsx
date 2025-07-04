import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CreatePermit', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });


  it('returns null when required cookies are missing', async () => {
    // Prevent fetch from being called
    const fetchSpy = vi.spyOn(global, 'fetch');
    fetchSpy.mockImplementation(() => {
      throw new Error('fetch should not be called when cookies are missing');
    });

    // Mock cookies BEFORE import
    vi.mock('next/headers', () => ({
      cookies: () => ({
        get: (key: string) => {
          const cookies: Record<string, { value: string } | undefined> = {
            session: { value: 'token' },
            plate: { value: 'XYZ123' },
            state: { value: 'CA' },
            // permit missing
          };
          return cookies[key];
        },
      }),
    }));

    // Import after mocks are set
    const { CreatePermit } = await import('@/app/[locale]/permit/success/action');

    const result = await CreatePermit();
    expect(result).toBe(null);
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
