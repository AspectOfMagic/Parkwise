import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock the 'server-only' import
vi.mock('server-only', () => ({}));

beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mocked_key_123';
});

describe('Stripe Library', () => {
  it('should initialize Stripe with the secret key', async () => {
    const stripeModule = await import('@/app/lib/stripe');
    
    expect(stripeModule.stripe).toBeDefined();
    expect(stripeModule.stripe).toHaveProperty('customers');
    expect(typeof stripeModule.stripe.customers.create).toBe('function');
  });

  it('should throw if secret key is not provided', async () => {
    const originalKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    // Re-import in a clean context
    vi.resetModules();
    await expect(async () => {
      await import('@/app/lib/stripe');
    }).rejects.toThrow();

    process.env.STRIPE_SECRET_KEY = originalKey; // Restore
  });
});
