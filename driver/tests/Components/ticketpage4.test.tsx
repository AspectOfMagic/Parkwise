import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TicketPage from '@/app/[locale]/ticket/page';
import * as ticketActions from '@/app/[locale]/ticket/actions';

vi.mock('server-only', () => ({}));

// Router + cookies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
vi.mock('js-cookie', () => ({
  set: vi.fn(),
}));

// Translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const t: Record<string, string> = {
      'ticket.top1': 'Account',
      'ticket.top2': 'Pay Ticket',
      'ticket.text1': 'Select Vehicle:',
      'ticket.text2': 'Select All Tickets',
      'ticket.text3': 'Total Balance:',
      'ticket.text4': 'Ticket',
      'ticket.status.unpaid': 'Unpaid',
      'ticket.cost': 'Cost: $',
      'vehicle.select': 'Select Vehicle',
      'button.pay': 'Submit',
      'placeholder.challenge': 'Enter your reason...',
    };
    return t[key] || key;
  },
}));

vi.mock('@/app/[locale]/home/Header', () => ({
  default: () => <div>MockHeader</div>,
}));

describe('TicketPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(ticketActions, 'getVehicles').mockResolvedValue([
      {
        id: 'v1',
        make: 'Tesla',
        model: 'Model 3',
        plate: 'TESLA123',
        year: 2022,
        color: 'White',
        state: 'CA',
      },
    ]);

    vi.spyOn(ticketActions, 'getTickets').mockImplementation(async (vehicleId: string) => {
      return [
        {
          id: 'tPaid',
          cost: 100,
          status: 'paid',
          vehicle: vehicleId,
          issued: '2024-01-01T00:00:00.000Z',
          deadline: '2024-02-01T00:00:00.000Z',
        },
      ];
    });
  });

  it('skips rendering tickets with paid status', async () => {
    render(<TicketPage />);

    const radio = await screen.findByLabelText(/Tesla Model 3/i);
    fireEvent.click(radio);

    await new Promise((r) => setTimeout(r, 200));

    const ticket = screen.queryByLabelText(/Ticket #/i);
    expect(ticket).not.toBeTruthy();
  });
  
});
