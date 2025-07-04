import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import CheckoutForm from '@/app/[locale]/permit/checkout/checkout';

const mockConfirmPayment = vi.fn();

// Mock stripe-js and react-stripe-js
vi.mock('@stripe/react-stripe-js', async () => {
  const actual = await vi.importActual('@stripe/react-stripe-js');
  return {
    ...actual,
    Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PaymentElement: () => <div data-testid="payment-element" />,
    useStripe: () => ({
      confirmPayment: mockConfirmPayment
    }),
    useElements: () => ({}),
  };
});

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('CheckoutForm', () => {
  it('calls confirmPayment and sets error message for card_error', async () => {
    mockConfirmPayment.mockResolvedValueOnce({
      error: { type: 'card_error', message: 'Your card was declined.' }
    });

    render(<CheckoutForm clientSecret="test_secret" />);
    const form = screen.getByTestId('payment-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockConfirmPayment).toHaveBeenCalled();
      expect(screen.queryByText('Your card was declined.')).not.toBeNull();
    });
  });

  it('handles unknown error from confirmPayment', async () => {
    mockConfirmPayment.mockResolvedValueOnce({
      error: { type: 'api_connection_error', message: 'Something strange happened.' }
    });

    render(<CheckoutForm clientSecret="test_secret" />);
    fireEvent.submit(screen.getByTestId('payment-form'));

    await waitFor(() => {
      expect(mockConfirmPayment).toHaveBeenCalled();
      expect(screen.queryByText('An unexpected error occurred.')).not.toBeNull();
    });
  });
    it('returns early when stripe or elements are not loaded', async () => {
    vi.resetModules();

    vi.doMock('@stripe/react-stripe-js', async () => {
        const actual = await vi.importActual('@stripe/react-stripe-js');
        return {
        ...actual,
        Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        PaymentElement: () => <div data-testid="payment-element" />,
        useStripe: () => null,     // simulate unready stripe
        useElements: () => null,   // simulate unready elements
        };
    });

    const { default: CheckoutForm } = await import('@/app/[locale]/permit/checkout/checkout');

    render(<CheckoutForm clientSecret="test_secret" />);
    fireEvent.submit(screen.getByTestId('payment-form'));

    await waitFor(() => {
        expect(mockConfirmPayment).not.toHaveBeenCalled();
    });
    });
});
