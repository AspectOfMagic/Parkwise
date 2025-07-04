import { vi, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import React from 'react';

import { rejectChallenge, acceptChallenge, fetchChallenges } from '@/app/dashboard/actions';
import TicketList from '@/app/components/TicketList';
import { Ticket } from '@/verify';

vi.mock('../../src/app/dashboard/actions', () => ({
  fetchChallenges: vi.fn(),
	rejectChallenge: vi.fn(),
	acceptChallenge: vi.fn()
}))

afterEach(() => {
  cleanup();
	vi.clearAllMocks();
});

const mockTickets = [
	{
		id: '3c37dfce-b5e4-43fb-a807-658e6b0d888e',
		vehicle: '8b40dfce-z1e4-40xb-a807-931e6b0d899e',
		cost: 50,
		issued: '2025-06-01T09:00:00Z',
		deadline: '2025-07-01T09:00:00Z',
		status: 'challenged',
    desc: undefined
	},
	{
		id: '2d59zxda-c9e4-43fb-a807-658e6b0d888e',
		vehicle: '3a91vtst-z1e4-40xb-a807-931e6b0d899e',
		cost: 50,
		issued: '2025-06-03T09:00:00Z',
		deadline: '2025-07-03T09:00:00Z',
		status: 'challenged',
    desc: 'test challenge'
	},
] as Ticket[]

it('Challenged tickets are fetched and displayed correctly', async () => {
	vi.mocked(fetchChallenges).mockResolvedValue(mockTickets)
	render(<TicketList />)
	await waitFor(() => {
		expect(screen.getByText('June 1, 2025')).toBeDefined()
	})
})



it('acceptChallenge successfully accepts challenge on click', async () => {
  vi.mocked(fetchChallenges).mockResolvedValue(mockTickets)
  vi.mocked(acceptChallenge).mockResolvedValue(mockTickets[0])
  
  render(<TicketList />)
  
  // Wait for both tickets to be rendered
  await waitFor(() => {
    expect(screen.getByText('June 1, 2025')).toBeDefined()
    expect(screen.getByText('June 3, 2025')).toBeDefined()
  })
  
  // Mock the updated response after accepting the first challenge
  vi.mocked(fetchChallenges).mockResolvedValue([mockTickets[1]]) // Only second ticket remains
  
  const acceptBtn = screen.getByLabelText('accept-challenge0')
  const user = userEvent.setup()
  await user.click(acceptBtn)
  
  // Wait for the first ticket to be removed
  await waitFor(() => {
    expect(screen.queryByText('June 1, 2025')).toBeNull()
  })
  
  // The second ticket should still be there
  expect(screen.getByText('June 3, 2025')).toBeDefined()
})

it('rejectChallenge successfully rejects challenge on click', async () => {
	vi.mocked(fetchChallenges).mockResolvedValue(mockTickets)
  vi.mocked(rejectChallenge).mockResolvedValue(mockTickets[0])
  
  render(<TicketList />)
  
  // Wait for both tickets to be rendered
  await waitFor(() => {
    expect(screen.getByText('June 1, 2025')).toBeDefined()
    expect(screen.getByText('June 3, 2025')).toBeDefined()
  })
  
  // Mock the updated response after accepting the first challenge
  vi.mocked(fetchChallenges).mockResolvedValue([mockTickets[1]]) // Only second ticket remains
  
  const rejectBtn = screen.getByLabelText('reject-challenge0')
  const user = userEvent.setup()
  await user.click(rejectBtn)
  
  // Wait for the first ticket to be removed
  await waitFor(() => {
    expect(screen.queryByText('June 1, 2025')).toBeNull()
  })
  
  // The second ticket should still be there
  expect(screen.getByText('June 3, 2025')).toBeDefined()
})

it('Text renders correctly when no tickets are being challenged', async () => {
	vi.mocked(fetchChallenges).mockResolvedValue([])
  render(<TicketList />)
  await waitFor(() => {
    expect(screen.getByText('No challenged tickets found.')).toBeDefined()
  })
})

it('Challenge description opens correctly on click of issue date', async () => {
  vi.mocked(fetchChallenges).mockResolvedValue(mockTickets)
  render(<TicketList />)
  await waitFor(() => {
    expect(screen.getByText('June 3, 2025')).toBeDefined()
  })
  const openDesc = screen.getByLabelText('open-desc0')
  const user = userEvent.setup()
  await user.click(openDesc)
  await waitFor(() => {
    expect(screen.getByText('Challenge Description')).toBeDefined()
  })
})

it('Challenge description closes correctly on click of close button in popup', async () => {
  vi.mocked(fetchChallenges).mockResolvedValue(mockTickets)
  render(<TicketList />)
  await waitFor(() => {
    expect(screen.getByText('June 1, 2025')).toBeDefined()
  })
  const openDesc = screen.getByLabelText('open-desc1')
  const user = userEvent.setup()
  await user.click(openDesc)
  await waitFor(() => {
    expect(screen.getByText('Challenge Description')).toBeDefined()
  })

  const closeDesc = screen.getByLabelText('close-desc')
  await user.click(closeDesc)

  await waitFor(() => {
    expect(screen.queryByText('Challenge Description')).toBeNull()
  })
})

