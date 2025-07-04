import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('server-only', () => ({}));

const mockPayTicket = vi.fn().mockResolvedValue(true);
vi.mock('@/app/[locale]/ticket/success/action', () => ({
  PayTicket: mockPayTicket,
}));

const mockRetrieve = vi.fn();
vi.mock('@/app/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      retrieve: mockRetrieve,
    },
  },
}));

const mockRedirect = vi.fn(() => {
  throw new Error('redirected');
});
vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

describe('Ticket SuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders success message when payment succeeded', async () => {
    mockRetrieve.mockResolvedValueOnce({ status: 'succeeded' });

    const { default: SuccessPage } = await import('@/app/[locale]/ticket/success/page');
    render(await SuccessPage({ searchParams: { payment_intent: 'pi_123' } }));

    await waitFor(() => {
      expect(mockPayTicket).toHaveBeenCalled();
      expect(screen.getByText(/Payment succeeded/i)).toBeTruthy();
      expect(screen.getByText('pi_123')).toBeTruthy();
      expect(screen.getByText('succeeded')).toBeTruthy();
    });
  });

  it('redirects if no payment_intent param', async () => {
    const { default: SuccessPage } = await import('@/app/[locale]/ticket/success/page');
    await expect(() => SuccessPage({ searchParams: {} })).rejects.toThrow('redirected');
  });

  it('redirects if paymentIntent not found', async () => {
    mockRetrieve.mockResolvedValueOnce(null);
    const { default: SuccessPage } = await import('@/app/[locale]/ticket/success/page');
    await expect(() =>
      SuccessPage({ searchParams: { payment_intent: 'pi_none' } })
    ).rejects.toThrow('redirected');
  });

  it('renders non-succeeded status without PayTicket call', async () => {
    mockRetrieve.mockResolvedValueOnce({ status: 'requires_payment_method' });

    const { default: SuccessPage } = await import('@/app/[locale]/ticket/success/page');
    render(await SuccessPage({ searchParams: { payment_intent: 'pi_fail' } }));

    await waitFor(() => {
      expect(mockPayTicket).not.toHaveBeenCalled();
      expect(screen.getByText(/not successful/i)).toBeTruthy();
      expect(screen.getByText('pi_fail')).toBeTruthy();
      expect(screen.getByText('requires_payment_method')).toBeTruthy();
    });
  });

  it('logs error if PayTicket throws during succeeded payment', async () => {
    mockRetrieve.mockResolvedValueOnce({ status: 'succeeded' });
    const error = new Error('ticket failed');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockPayTicket.mockRejectedValueOnce(error);

    const { default: SuccessPage } = await import('@/app/[locale]/ticket/success/page');
    render(await SuccessPage({ searchParams: { payment_intent: 'pi_throw' } }));

    expect(mockPayTicket).toHaveBeenCalledWith();
    expect(logSpy).toHaveBeenCalledWith(error);

    logSpy.mockRestore();
  });
});
