import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('server-only', () => ({}));

// Mock CreatePermit
const mockCreatePermit = vi.fn().mockResolvedValue(true);
vi.mock('@/app/[locale]/permit/success/action', () => ({
  CreatePermit: mockCreatePermit,
}));

// Mock stripe.paymentIntents.retrieve
const mockRetrieve = vi.fn();
vi.mock('@/app/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      retrieve: mockRetrieve,
    },
  },
}));

// Mock redirect
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

describe('SuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders success status with payment intent details', async () => {
    mockRetrieve.mockResolvedValueOnce({ status: 'succeeded' });

    const { default: SuccessPage } = await import('@/app/[locale]/permit/success/page');

    render(
      await SuccessPage({ searchParams: { payment_intent: 'pi_12345' } })
    );

    await waitFor(() => {
      expect(mockCreatePermit).toHaveBeenCalledWith('pi_12345');
      expect(screen.getByText('Payment succeeded')).toBeTruthy();
      expect(screen.getByText('pi_12345')).toBeTruthy();
      expect(screen.getByText('succeeded')).toBeTruthy();
    });
  });

    it('redirects if payment_intent is missing', async () => {
    const redirectMock = vi.fn(() => {
        throw new Error('redirected');
    });
    vi.mocked(mockRedirect).mockImplementation(redirectMock);

    const { default: SuccessPage } = await import('@/app/[locale]/permit/success/page');

    await expect(() => SuccessPage({ searchParams: {} })).rejects.toThrow('redirected');
    });

    it('redirects if paymentIntent retrieval fails', async () => {
    mockRetrieve.mockResolvedValueOnce(null); // simulate failure

    const redirectMock = vi.fn(() => {
        throw new Error('redirected');
    });
    vi.mocked(mockRedirect).mockImplementation(redirectMock);

    const { default: SuccessPage } = await import('@/app/[locale]/permit/success/page');

    await expect(() =>
        SuccessPage({ searchParams: { payment_intent: 'pi_missing' } })
    ).rejects.toThrow('redirected');
    });

  it('handles non-succeeded statuses without calling CreatePermit', async () => {
    mockRetrieve.mockResolvedValueOnce({ status: 'requires_payment_method' });

    const { default: SuccessPage } = await import('@/app/[locale]/permit/success/page');

    render(
      await SuccessPage({ searchParams: { payment_intent: 'pi_failed' } })
    );

    await waitFor(() => {
      expect(mockCreatePermit).not.toHaveBeenCalled();
      expect(screen.getByText('Your payment was not successful, please try again.')).toBeTruthy();
      expect(screen.getByText('pi_failed')).toBeTruthy();
      expect(screen.getByText('requires_payment_method')).toBeTruthy();
    });
  });
  it('logs error if CreatePermit throws during succeeded payment', async () => {
    mockRetrieve.mockResolvedValueOnce({ status: 'succeeded' });

    const error = new Error('Permit creation failed');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockCreatePermit.mockRejectedValueOnce(error); // Simulate error

    const { default: SuccessPage } = await import('@/app/[locale]/permit/success/page');

    render(await SuccessPage({ searchParams: { payment_intent: 'pi_errored' } }));

    expect(mockCreatePermit).toHaveBeenCalledWith('pi_errored');
    expect(logSpy).toHaveBeenCalledWith(error);

    logSpy.mockRestore();
    });
});
