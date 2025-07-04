import { it, expect, beforeEach, vi } from 'vitest';

import { ticketService } from '../../src/verify/service';
import { Ticket } from '../../src/verify/index';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
  vi.clearAllMocks();
});

it('Should fetch challenges correctly', async () => {
	const mockTicket: Ticket = {
		id: '3c37dfce-b5e4-43fb-a807-658e6b0d888e',
		vehicle: '8b40dfce-z1e4-40xb-a807-931e6b0d899e',
		cost: 50,
		issued: '2025-06-03T09:00:00Z',
		deadline: '2025-07-03T09:00:00Z',
		status: 'challenged'
	}

	mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: {
        getChallenges: mockTicket
      }
    })
  });

	const result = await ticketService.getChallenges()
  // Verify result matches expected vehicle data
  expect(result).toEqual(mockTicket);
})

it('should throw an error when ticket GraphQL query fails', async () => {
  // Mock error response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      errors: [{ message: 'No tickets currently being challenged' }]
    })
  });

  await expect(ticketService.getChallenges())
    .rejects.toThrow('No tickets currently being challenged');

  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:4001/graphql',
    expect.anything()
  );
});

it('should accept challenge correctly', async () => {
	const ticketId = '3c37dfce-b5e4-43fb-a807-658e6b0d888e';
	const mockAcceptedTicket: Ticket = {
		id: ticketId,
		vehicle: '8b40dfce-z1e4-40xb-a807-931e6b0d899e',
		cost: 50,
		issued: '2025-06-03T09:00:00Z',
		deadline: '2025-07-03T09:00:00Z',
		status: 'accepted'
	};

	mockFetch.mockResolvedValueOnce({
		ok: true,
		json: async () => ({
			data: {
				acceptChallenge: mockAcceptedTicket
			}
		})
	});

	const result = await ticketService.acceptChallenge(ticketId);
	
	expect(result).toEqual(mockAcceptedTicket);
	expect(mockFetch).toHaveBeenCalledWith(
		'http://localhost:4001/graphql',
		expect.objectContaining({
			method: 'POST',
			headers: expect.objectContaining({
				'Content-Type': 'application/json'
			}),
			body: expect.stringContaining('acceptChallenge')
		})
	);
});

it('should accept challenge with token correctly', async () => {
	const ticketId = '3c37dfce-b5e4-43fb-a807-658e6b0d888e';
	const token = 'test-auth-token';
	const mockAcceptedTicket: Ticket = {
		id: ticketId,
		vehicle: '8b40dfce-z1e4-40xb-a807-931e6b0d899e',
		cost: 50,
		issued: '2025-06-03T09:00:00Z',
		deadline: '2025-07-03T09:00:00Z',
		status: 'accepted'
	};

	mockFetch.mockResolvedValueOnce({
		ok: true,
		json: async () => ({
			data: {
				acceptChallenge: mockAcceptedTicket
			}
		})
	});

	const result = await ticketService.acceptChallenge(ticketId, token);
	
	expect(result).toEqual(mockAcceptedTicket);
	expect(mockFetch).toHaveBeenCalledWith(
		'http://localhost:4001/graphql',
		expect.objectContaining({
			method: 'POST',
			headers: expect.objectContaining({
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}),
			body: expect.stringContaining('acceptChallenge')
		})
	);
});

it('should throw an error when acceptChallenge GraphQL mutation fails', async () => {
	const ticketId = '3c37dfce-b5e4-43fb-a807-658e6b0d888e';
	
	mockFetch.mockResolvedValueOnce({
		ok: true,
		json: async () => ({
			errors: [{ message: 'Failed to accept challenge' }]
		})
	});

	await expect(ticketService.acceptChallenge(ticketId))
		.rejects.toThrow('Failed to accept challenge');

	expect(mockFetch).toHaveBeenCalledWith(
		'http://localhost:4001/graphql',
		expect.anything()
	);
});

it('should reject challenge correctly', async () => {
	const ticketId = '3c37dfce-b5e4-43fb-a807-658e6b0d888e';
	const mockRejectedTicket: Ticket = {
		id: ticketId,
		vehicle: '8b40dfce-z1e4-40xb-a807-931e6b0d899e',
		cost: 50,
		issued: '2025-06-03T09:00:00Z',
		deadline: '2025-07-03T09:00:00Z',
		status: 'rejected'
	};

	mockFetch.mockResolvedValueOnce({
		ok: true,
		json: async () => ({
			data: {
				rejectChallenge: mockRejectedTicket
			}
		})
	});

	const result = await ticketService.rejectChallenge(ticketId);
	
	expect(result).toEqual(mockRejectedTicket);
	expect(mockFetch).toHaveBeenCalledWith(
		'http://localhost:4001/graphql',
		expect.objectContaining({
			method: 'POST',
			headers: expect.objectContaining({
				'Content-Type': 'application/json'
			}),
			body: expect.stringContaining('rejectChallenge')
		})
	);
});

it('should reject challenge with token correctly', async () => {
	const ticketId = '3c37dfce-b5e4-43fb-a807-658e6b0d888e';
	const token = 'test-auth-token';
	const mockRejectedTicket: Ticket = {
		id: ticketId,
		vehicle: '8b40dfce-z1e4-40xb-a807-931e6b0d899e',
		cost: 50,
		issued: '2025-06-03T09:00:00Z',
		deadline: '2025-07-03T09:00:00Z',
		status: 'rejected'
	};

	mockFetch.mockResolvedValueOnce({
		ok: true,
		json: async () => ({
			data: {
				rejectChallenge: mockRejectedTicket
			}
		})
	});

	const result = await ticketService.rejectChallenge(ticketId, token);
	
	expect(result).toEqual(mockRejectedTicket);
	expect(mockFetch).toHaveBeenCalledWith(
		'http://localhost:4001/graphql',
		expect.objectContaining({
			method: 'POST',
			headers: expect.objectContaining({
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}),
			body: expect.stringContaining('rejectChallenge')
		})
	);
});

it('should throw an error when rejectChallenge GraphQL mutation fails', async () => {
	const ticketId = '3c37dfce-b5e4-43fb-a807-658e6b0d888e';
	
	mockFetch.mockResolvedValueOnce({
		ok: true,
		json: async () => ({
			errors: [{ message: 'Failed to reject challenge' }]
		})
	});

	await expect(ticketService.rejectChallenge(ticketId))
		.rejects.toThrow('Failed to reject challenge');

	expect(mockFetch).toHaveBeenCalledWith(
		'http://localhost:4001/graphql',
		expect.anything()
	);
});
