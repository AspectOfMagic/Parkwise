import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('server-only', () => ({}));

vi.mock('@/app/lib/stripe', async () => {
  const stripeMock = {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        client_secret: 'mocked_client_secret_123',
      }),
    },
  };

  return {
    stripe: stripeMock,
  };
});

vi.mock('@/app/[locale]/permit/checkout/action', () => ({
  SetCheckout: vi.fn().mockResolvedValue(50),
}));

vi.mock('@/app/[locale]/permit/checkout/checkout', () => ({
  __esModule: true,
  default: ({ clientSecret }: { clientSecret: string }) => (
    <div data-testid="mock-checkout">ClientSecret: {clientSecret}</div>
  ),
}));

describe('IndexPage', () => {
  it('fetches permit and renders CheckoutForm with clientSecret', async () => {
    const { default: IndexPage } = await import('@/app/[locale]/permit/checkout/page');

    render(await IndexPage());

    await waitFor(() => {
      expect(screen.getByTestId('mock-checkout').textContent).toBe(
        'ClientSecret: mocked_client_secret_123'
      );
    });
  });
});
