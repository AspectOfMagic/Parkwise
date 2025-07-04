import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SetCheckout } from '@/app/[locale]/ticket/checkout/actions';
import { ticketService } from '@/verify/service';
import type { Ticket } from '@/verify';


vi.mock('@/verify/service', () => ({
  ticketService: {
    getTicketById: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => {
      if (name === 'tickets') {
        return { value: JSON.stringify(['t123']) };
      }
      if (name === 'session') {
        return { value: 'mock-token' };
      }
      return undefined;
    },
  }),
}));

describe('SetCheckout()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ticket cost * 100', async () => {
   vi.mocked(ticketService.getTicketById).mockResolvedValue({
    id: 't123',
    vehicle: 'v1',
    cost: 25,
    issued: '2024-01-01T00:00:00Z',
    deadline: '2024-02-01T00:00:00Z',
    status: 'unpaid',
    } as unknown as Ticket[]);

    const result = await SetCheckout();
    expect(result).toBe(2500);
    expect(ticketService.getTicketById).toHaveBeenCalledWith('t123', 'mock-token');
  });
});
