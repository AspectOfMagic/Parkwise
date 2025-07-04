import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayTicket } from '@/app/[locale]/ticket/success/action';
import { ticketService } from '@/verify/service';

let mockCookieValue: Record<string, string | undefined> = {
  session: 'mock-token',
  tickets: JSON.stringify(['t123']),
};

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (key: string) =>
      mockCookieValue[key]
        ? { value: mockCookieValue[key] as string }
        : undefined,
  }),
}));

vi.mock('@/verify/service', () => ({
  ticketService: {
    payTicket: vi.fn(),
  },
}));

describe('PayTicket()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieValue = {
      session: 'mock-token',
      tickets: JSON.stringify(['t123']),
    };
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

    it('pays ticket successfully', async () => {
    const mockTicket = {
        id: 't123',
        vehicle: 'v1',
        cost: 100,
        issued: '2024-01-01T00:00:00Z',
        deadline: '2024-02-01T00:00:00Z',
        status: 'paid',
    };

    vi.mocked(ticketService.payTicket).mockResolvedValue(mockTicket);

    const result = await PayTicket();
    expect(result).toEqual(mockTicket);
    expect(ticketService.payTicket).toHaveBeenCalledWith('t123', 'mock-token');
    });
  it('handles missing session token', async () => {
    mockCookieValue.session = undefined;

    const result = await PayTicket();
    expect(result).toBeUndefined();
  });

  it('handles missing ticket cookie', async () => {
    mockCookieValue.tickets = undefined;

    const result = await PayTicket();
    expect(result).toBeUndefined();
  });

  it('handles service failure', async () => {
    vi.mocked(ticketService.payTicket).mockRejectedValue(new Error('fail'));

    const result = await PayTicket();
    expect(result).toBeUndefined();
  });
});
