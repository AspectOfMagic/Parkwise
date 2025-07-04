import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selectAllTicketsHelper } from '@/app/[locale]/ticket/helpers';

vi.mock('server-only', () => ({}));

// Router + cookies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
vi.mock('js-cookie', () => ({
  set: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const t: Record<string, string> = {
      text1: 'Select Vehicle:',
      text2: 'Select All Tickets',
      text3: 'Total Balance:',
      text4: 'Ticket',
      'button.pay': 'Submit',
      top1: 'Account',
      top2: 'Pay Ticket',
    };
    return t[key] || key;
  },
}));

// Header mock
vi.mock('@/app/[locale]/home/Header', () => ({
  default: () => <div>MockHeader</div>,
}));


describe('selectAllTicketsHelper', () => {
  const sampleTickets = {
    v1: [
      { id: 't1', cost: 50, status: 'unpaid', vehicle: 'v1', issued: '', deadline: '' },
      { id: 't2', cost: 100, status: 'unpaid', vehicle: 'v1', issued: '', deadline: '' },
    ],
  };

  it('returns the same ticketIds if no vehicle is selected', () => {
    const result = selectAllTicketsHelper(sampleTickets, null, ['t1']);
    expect(result).toEqual(['t1']);
  });

  it('selects all tickets if not all are currently selected', () => {
    const result = selectAllTicketsHelper(sampleTickets, 'v1', []);
    expect(result).toEqual(['t1', 't2']);
  });

  it('deselects all if all tickets are currently selected', () => {
    const result = selectAllTicketsHelper(sampleTickets, 'v1', ['t1', 't2']);
    expect(result).toEqual([]);
  });

  it('returns empty array if vehicle has no tickets', () => {
    const result = selectAllTicketsHelper({ v2: [] }, 'v2', []);
    expect(result).toEqual([]);
  });
});

