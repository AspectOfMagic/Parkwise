import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      'ticket.text2': 'Select All Tickets',
      'ticket.text4': 'Ticket',
      'button.pay': 'Submit',
      'placeholder.challenge': 'Enter your reason...',
      'text4': 'Ticket',
    };
    return t[key] || key;
  },
}));

// Header mock
vi.mock('@/app/[locale]/home/Header', () => ({
  default: () => <div>MockHeader</div>,
}));

describe('TicketPage Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(ticketActions, 'getVehicles').mockResolvedValue([
      {
        id: 'v1',
        make: 'Honda',
        model: 'Civic',
        plate: 'XYZ123',
        year: 2018,
        color: 'Blue',
        state: 'CA',
      },
    ]);

    vi.spyOn(ticketActions, 'getTickets').mockResolvedValue([
      {
        id: 't1',
        cost: 50,
        status: 'unpaid',
        vehicle: 'v1',
        issued: '2023-01-01T00:00:00.000Z',
        deadline: '2023-02-01T00:00:00.000Z',
      },
    ]);
  });

  it('handles challenge failure and closes popup', async () => {
    vi.spyOn(ticketActions, 'challengeTicket').mockRejectedValue(new Error('fail'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<TicketPage />);
    await screen.findByText('Honda Civic');

    fireEvent.click(screen.getByRole('radio', { name: /honda/i }));
    await screen.findByRole('checkbox', { name: /ticket #t1/i });

    fireEvent.click(screen.getByTestId('GavelIcon'));
    const textarea = await screen.findByPlaceholderText(/enter your reason/i);
    fireEvent.change(textarea, { target: { value: 'failure test' } });
    fireEvent.click(screen.getByText('Submit'));

    await screen.findByText(/Describe your challenge/i);
    await new Promise((r) => setTimeout(r, 500));

    expect(screen.queryByText(/Describe your challenge/i)).not.toBeTruthy();
    errorSpy.mockRestore();
  });
});
