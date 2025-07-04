import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TicketView from '@/app/components/TicketView';

vi.mock('@/app/components/TicketList', () => ({
  default: () => <div data-testid="ticket-list-mock">Mocked TicketList</div>,
}));

describe('TicketView', () => {

  it('renders main header', () => {
    render(<TicketView />);
    const heading = screen.getByText(/Ticket Management/i);
    expect(heading).toBeDefined();
  });
})