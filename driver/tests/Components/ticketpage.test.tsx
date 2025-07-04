import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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
  __esModule: true,
  default: {
    set: vi.fn(),
    get: vi.fn(() => undefined),
    remove: vi.fn(),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
  };
});
vi.mock('@/app/[locale]/ticket/actions', () => ({
  getVehicles: vi.fn(() => Promise.resolve([
    {
      id: 'v1',
      make: 'Toyota',
      model: 'Camry',
      plate: '123ABC',
      year: 2020,
      color: 'Silver',
      state: 'CA',
    },
  ])),
  getTickets: vi.fn(() => Promise.resolve([
    { 
      id: 't1', 
      status: 'unpaid', 
      cost: 50,
      vehicleId: 'v1',
      location: 'Campus Lot A',
      date: '2024-01-01',
      time: '10:00 AM'
    },
    { 
      id: 't2', 
      status: 'unpaid', 
      cost: 75,
      vehicleId: 'v1',
      location: 'Campus Lot B',
      date: '2024-01-02',
      time: '2:00 PM'
    },
  ])),
  challengeTicket: vi.fn(() => Promise.resolve({})),
}));

vi.mock('../home/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));
import TicketPage from '@/app/[locale]/ticket/page';
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  localStorageMock.getItem.mockReturnValue(null);
});

describe('TicketPage', () => {
  it('renders vehicle selection', async () => {
    render(<TicketPage />);
    const vehicleRadio = await screen.findByLabelText('Toyota Camry');
    expect(vehicleRadio).toBeTruthy();
  });
    it('opens challenge popup when gavel icon is clicked', async () => {
    render(<TicketPage />);
    fireEvent.click(await screen.findByLabelText('Toyota Camry'));
    const gavelIcon = screen.getAllByTestId('GavelIcon')[0];
    fireEvent.click(gavelIcon);
    expect(await screen.findByText(/Describe your challenge/i)).toBeTruthy();
    });
    it('toggles ticket selection correctly', async () => {
    render(<TicketPage />);

    // Select a vehicle
    const radios = await screen.findAllByLabelText('Toyota Camry');
        fireEvent.click(radios[0]);

    // Wait for checkboxes to load
    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    const checkbox = checkboxes[0] as HTMLInputElement;

    // Select ticket
    fireEvent.click(checkbox);
    await waitFor(() => {
        expect(checkbox.checked).toBe(true);
    });

    // Deselect ticket
    fireEvent.click(checkbox);
    await waitFor(() => {
        expect(checkbox.checked).toBe(false);
    });
    });
    it('selects and deselects all tickets using Select All button', async () => {
    render(<TicketPage />);
    
    // Select a vehicle to show its tickets
        const radios = await screen.findAllByLabelText('Toyota Camry');
            fireEvent.click(radios[0]);

    // Wait for checkboxes (only open tickets are rendered)
    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes.length).toBe(2); // Only 2 visible checkboxes (open tickets)

    const [firstTicketCheckbox, secondTicketCheckbox] = checkboxes;

    // Select all
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));

    expect((firstTicketCheckbox as HTMLInputElement).checked).toBe(true);
    expect((secondTicketCheckbox as HTMLInputElement).checked).toBe(true);

    // Deselect all
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));

    expect((firstTicketCheckbox as HTMLInputElement).checked).toBe(false);
    expect((secondTicketCheckbox as HTMLInputElement).checked).toBe(false);
    });

    it('submits a challenge, shows success, and cleans up after 2500ms', async () => {
        render(<TicketPage />);

        const radios = await screen.findAllByLabelText('Toyota Camry');
        fireEvent.click(radios[0]);

        const gavelIcon = screen.getAllByTestId('GavelIcon')[0];
        fireEvent.click(gavelIcon);

        expect(await screen.findByText(/Describe your challenge/i)).toBeTruthy();

        const textarea = screen.getByPlaceholderText(/Enter your reason here/i);
        fireEvent.change(textarea, { target: { value: 'This is unfair' } });
        expect((textarea as HTMLTextAreaElement).value).toBe('This is unfair');

        const submitBtn = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitBtn);
        const successText = await screen.findByText(/Challenge successfully sent/i, {}, { timeout: 5000 });
        expect(successText).toBeTruthy();

        const svg = document.querySelector('svg');
        expect(svg).toBeTruthy();

      await new Promise((r) => setTimeout(r, 2700));

      await waitFor(() => {
        expect(screen.queryByText(/Challenge successfully sent/i)).not.toBeTruthy();
      });
    }, 8000);
    it('clicks Pay button and triggers localStorage, cookie, and redirect', async () => {
    render(<TicketPage />);

    // Select the vehicle
    const radios = await screen.findAllByLabelText('Toyota Camry');
    fireEvent.click(radios[0]);

    // Select a ticket
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // Click the Pay button
    const payButton = await screen.findByRole('button', { name: /pay/i });
    fireEvent.click(payButton);

    expect(localStorage.setItem).toHaveBeenCalledWith(
        'pendingTicketIds',
        JSON.stringify(['t1']) 
    );

    const Cookies = (await import('js-cookie')).default;
    expect(Cookies.set).toHaveBeenCalledWith(
        'tickets',
        JSON.stringify(['t1']),
        expect.objectContaining({
        path: '/',
        sameSite: 'Lax',
        })
    );

    expect(mockPush).toHaveBeenCalledWith('/ticket/checkout');
    });

});
