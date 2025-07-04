import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';

// Stripe mocks will be updated in tests
let mockConfirmPayment = vi.fn();
let mockUseStripe: any;
let mockUseElements: any;

vi.mock('@stripe/react-stripe-js', async () => {
  const actual = await vi.importActual('@stripe/react-stripe-js');
  return {
    ...actual,
    useStripe: () => mockUseStripe(),
    useElements: () => mockUseElements(),
    PaymentElement: ({ id }: { id?: string }) => <div data-testid="payment-element" id={id} />,
    Elements: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  };
});

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: () => Promise.resolve({}),
}));

describe('CheckoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirmPayment = vi.fn();
    mockUseStripe = () => null;
    mockUseElements = () => null;
    cleanup();
  });

  it('renders payment form with disabled button when Stripe is not ready', async () => {
    const { default: CheckoutForm } = await import('@/app/[locale]/ticket/checkout/checkout');
    render(<CheckoutForm clientSecret="test_secret" />);
    const buttons = screen.getAllByRole('button', { name: /pay now/i });
    expect(buttons.length).toBe(1);
    expect((buttons[0] as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByTestId('payment-element')).toBeTruthy();
  });

  it('does nothing when Stripe or Elements is not loaded', async () => {
    const { default: CheckoutForm } = await import('@/app/[locale]/ticket/checkout/checkout');
    render(<CheckoutForm clientSecret="test_secret" />);
    const form = screen.getByTestId('payment-element').closest('form')!;
    fireEvent.submit(form);
    expect(screen.queryByText(/unexpected error/i)).toBeNull();
  });

  it('shows card_error message if confirmPayment fails with card_error', async () => {
    const errorMessage = 'Your card was declined';

    mockUseStripe = () => ({
      confirmPayment: vi.fn().mockResolvedValue({
        error: {
          type: 'card_error',
          message: errorMessage,
        },
      }),
    });

    mockUseElements = () => ({}); // mock as loaded

    const { default: CheckoutForm } = await import('@/app/[locale]/ticket/checkout/checkout');
    render(<CheckoutForm clientSecret="test_secret" />);

    const form = screen.getByTestId('payment-element').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      const errorText = screen.queryByText((text) => text.includes(errorMessage));
      expect(errorText).toBeTruthy();
    });
  });
  it('shows generic error message if confirmPayment fails with unexpected error type', async () => {
    const genericErrorMessage = 'An unexpected error occurred.';

    mockUseStripe = () => ({
      confirmPayment: vi.fn().mockResolvedValue({
        error: {
          type: 'api_error', // not card_error or validation_error
          message: 'Something else failed',
        },
      }),
    });

    mockUseElements = () => ({}); // mock as loaded

    const { default: CheckoutForm } = await import('@/app/[locale]/ticket/checkout/checkout');
    render(<CheckoutForm clientSecret="test_secret" />);

    const form = screen.getByTestId('payment-element').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      const errorText = screen.queryByText(genericErrorMessage);
      expect(errorText).toBeTruthy();
    });
  });
});
