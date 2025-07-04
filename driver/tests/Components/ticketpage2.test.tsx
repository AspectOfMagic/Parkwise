import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketPage from '@/app/[locale]/ticket/page';

// Mocks
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string = '') => (key: string) => {
    const translations: Record<string, string> = {
      'ticket.top1': 'Account',
      'ticket.top2': 'Pay Ticket',
      'ticket.text1': 'Select Vehicle:',
      'ticket.text2': 'Select All Tickets',
      'ticket.text3': 'Total Balance:',
      'ticket.text4': 'Ticket',
      'ticket.status.unpaid': 'Unpaid',
      'ticket.cost': 'Cost: $',
      'vehicle.select': 'Select Vehicle',
    };
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return translations[fullKey] || fullKey;
  },
  useLocale: () => 'en',
  useMessages: () => ({}),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));



vi.mock('next-intl/navigation', () => ({
  createNavigation: () => ({
    Link: ({ children, href, ...props }: any) => (
      <a href={href} {...props}>{children}</a>
    ),
    redirect: vi.fn(),
    usePathname: () => '/ticket',
    useRouter: () => ({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
    getPathname: () => '/ticket',
  }),
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/ticket',
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
  redirect: vi.fn(),
  getPathname: () => '/ticket',
}));


vi.mock('js-cookie', () => ({
  set: vi.fn(),
}));

const mockGetVehicles = vi.fn();
const mockGetTickets = vi.fn();
const mockChallengeTicket = vi.fn();

vi.mock('@/app/[locale]/ticket/actions', () => ({
  getVehicles: () => mockGetVehicles(),
  getTickets: (id: string) => mockGetTickets(id),
  challengeTicket: (id: string, msg: string) => mockChallengeTicket(id, msg),
}));

describe('TicketPage', () => {
  beforeEach(() => {
    mockGetVehicles.mockReset();
    mockGetTickets.mockReset();
    mockChallengeTicket.mockReset();
  });

  it('selectAllTickets does nothing if no vehicle is selected', async () => {
    mockGetVehicles.mockResolvedValue([]); // No vehicles
    render(<TicketPage />);

    await waitFor(() => {
      expect(screen.queryByText('Select All Tickets')).toBeNull();
    });
  });

  it('selectAllTickets works even if vehicle has no tickets (triggers || [] fallback)', async () => {
    mockGetVehicles.mockResolvedValue([{ id: 'v1', make: 'Toyota', model: 'Camry' }]);
    mockGetTickets.mockResolvedValue(undefined); // no tickets available

    render(<TicketPage />);

    // Wait for the vehicle radio button and click it
    const radio = await screen.findByLabelText('Toyota Camry');
    fireEvent.click(radio);

    const button = await screen.findByText('Select All Tickets');
    fireEvent.click(button);

    // Just checking no crash, and total balance stays at 0
    expect(screen.getByText('Total Balance: $0')).toBeTruthy();
  });

  it('selectAllTickets does nothing when no vehicle selected', () => {
  render(<TicketPage />);
  // Simulate button click when no vehicle is selected
  const selectAll = screen.getByText('Select All Tickets');
  fireEvent.click(selectAll);

  // No crash, no selection
  expect(screen.queryAllByRole('checkbox', { checked: true })).toHaveLength(0);
});

});
