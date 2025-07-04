import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutForm from '@/app/[locale]/permit/checkout/checkout';


// Mock stripe-js and react-stripe-js
vi.mock('@stripe/react-stripe-js', async () => {
  const actual = await vi.importActual('@stripe/react-stripe-js');
  return {
    ...actual,
    Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PaymentElement: () => <div data-testid="payment-element" />,
    useStripe: () => null, // mock as not loaded
    useElements: () => null,
  };
});

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({}),
}));

describe('CheckoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with disabled Pay now button', async () => {
    render(<CheckoutForm clientSecret="test_secret" />);

    // Check for payment element placeholder
    expect(screen.getByTestId('payment-element')).toBeDefined();

    // Check for Pay now button
    const button = screen.getByRole('button', { name: /pay now/i }) as HTMLButtonElement;
    expect(button).toBeDefined();
    expect(button.disabled).toBe(true); // because useStripe/useElements return null
  });
  
});
