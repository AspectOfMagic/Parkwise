import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi, beforeEach, afterEach } from 'vitest';

import TicketIssueButton from '../../src/app/home/TicketIssueButton';
import { issueTicket } from '../../src/app/home/actions';

vi.mock('../../src/app/home/actions', () => ({
  issueTicket: vi.fn()
}));

beforeEach(() => {
  vi.restoreAllMocks();

  vi.mocked(issueTicket).mockResolvedValue({
    success: true,
    message: 'Ticket successfully issued'
  });
});

afterEach(() => {
  cleanup();
});

it('issues a ticket', async () => {
  const mockVehicleId = '123e4567-e89b-12d3-a456-426614174000';
  const mockLicensePlate = 'ABC123';
  const mockOnTicketIssued = vi.fn();
  const user = userEvent.setup();

  render(
    <TicketIssueButton
      vehicleId={mockVehicleId}
      licensePlate={mockLicensePlate}
      onTicketIssued={mockOnTicketIssued}
    />
  );

  const ticketButton = screen.getByLabelText('ticket-button');
  await user.click(ticketButton);

  // Check that issueTicket was called with correct parameters for vehicle with no valid permit
  expect(issueTicket).toHaveBeenCalledWith({
    licensePlate: mockLicensePlate,
    location: 'Campus Parking',
    violation: 'No Valid Permit',
    amount: 50,
    vehicleId: mockVehicleId
  });

  await waitFor(() => {
    expect(screen.getAllByText('Ticket successfully issued')).toBeDefined();
  });

  expect(mockOnTicketIssued).toHaveBeenCalledWith(true, 'Ticket successfully issued');

  // Find and click close button on snackbar
  const closeButton = screen.getByRole('button', { name: /close/i });
  await user.click(closeButton);
});

it('fails to issue a ticket and shows error message', async () => {
  // Override the mock to simulate a failure
  vi.mocked(issueTicket).mockRejectedValue(new Error('Network error'));

  const mockVehicleId = '123e4567-e89b-12d3-a456-426614174000';
  const mockLicensePlate = 'ABC123';
  const mockOnTicketIssued = vi.fn();
  const user = userEvent.setup();

  render(
    <TicketIssueButton
      vehicleId={mockVehicleId}
      licensePlate={mockLicensePlate}
      onTicketIssued={mockOnTicketIssued}
    />
  );

  const ticketButton = screen.getByLabelText('ticket-button');
  await user.click(ticketButton);

  await waitFor(() => {
    expect(screen.getByText('Failed to issue ticket')).toBeDefined();
  });

  expect(mockOnTicketIssued).toHaveBeenCalledWith(false, 'Failed to issue ticket');

  const closeButton = screen.getByRole('button', { name: /close/i });
  await user.click(closeButton);

  await waitFor(() => {
    expect(screen.queryByText('Failed to issue ticket')).toBeNull();
  });
});