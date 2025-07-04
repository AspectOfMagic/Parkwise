import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Allow server-only import
vi.mock('server-only', () => ({}));

// Mock Stripe payment intent creation
vi.mock('@/app/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        client_secret: 'mocked_ticket_secret_456',
      }),
    },
  },
}));

// Mock SetCheckout (ticket)
vi.mock('@/app/[locale]/ticket/checkout/actions', () => ({
  SetCheckout: vi.fn().mockResolvedValue(2500), // cents
}));

// Mock CheckoutForm component
vi.mock('@/app/[locale]/ticket/checkout/checkout', () => ({
  __esModule: true,
  default: ({ clientSecret }: { clientSecret: string }) => (
    <div data-testid="ticket-checkout">Secret: {clientSecret}</div>
  ),
}));

describe('Ticket Checkout IndexPage', () => {
  it('creates a payment intent using SetCheckout amount and renders CheckoutForm', async () => {
    const { default: IndexPage } = await import('@/app/[locale]/ticket/checkout/page');

    render(await IndexPage());

    await waitFor(() => {
      expect(screen.getByTestId('ticket-checkout').textContent).toBe(
        'Secret: mocked_ticket_secret_456'
      );
    });
  });
});
