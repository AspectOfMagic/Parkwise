import { it, expect, vi, beforeEach } from 'vitest';
import fetch from 'node-fetch';

import { checkStudentTickets } from '../../src/services/ticketService';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

const mockFetch = fetch as unknown as vi.Mock;

beforeEach(() => {
  vi.resetAllMocks();
});

it('should return correct data for student with unpaid tickets', async () => {
  const mockTickets = [
    { id: '1', issueDate: '2025-06-01', amount: 75, paid: false, dueDate: '2025-06-15' },
    { id: '2', issueDate: '2025-06-03', amount: 50, paid: false, dueDate: '2025-06-17' },
    { id: '3', issueDate: '2025-05-15', amount: 40, paid: true, dueDate: '2025-05-29' }
  ];

  mockFetch.mockResolvedValue({
    json: vi.fn().mockResolvedValue({
      data: {
        ticketsByEmail: mockTickets
      }
    })
  });

  const result = await checkStudentTickets('student@university.edu');

  // Verify fetch was called with correct parameters
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:4002/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: expect.any(String)
  });

  // Parse the request body to verify GraphQL query
  const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
  expect(requestBody.variables).toEqual({ email: 'student@university.edu' });
  expect(requestBody.query).toContain('ticketsByEmail');

  // Verify result
  expect(result).toEqual({
    hasOutstandingTickets: true,
    outstandingCount: 2,
    totalOwed: 125,  // 75 + 50
    tickets: mockTickets
  });
});

it('should return correct data for student with only paid tickets', async () => {
  const mockTickets = [
    { id: '1', issueDate: '2025-05-01', amount: 75, paid: true, dueDate: '2025-05-15' },
    { id: '2', issueDate: '2025-05-03', amount: 50, paid: true, dueDate: '2025-05-17' }
  ];

  mockFetch.mockResolvedValue({
    json: vi.fn().mockResolvedValue({
      data: {
        ticketsByEmail: mockTickets
      }
    })
  });

  const result = await checkStudentTickets('student@university.edu');

  expect(result).toEqual({
    hasOutstandingTickets: false,
    outstandingCount: 0,
    totalOwed: 0,
    tickets: mockTickets
  });
});

it('should return correct data for student with no tickets', async () => {
  mockFetch.mockResolvedValue({
    json: vi.fn().mockResolvedValue({
      data: {
        ticketsByEmail: []
      }
    })
  });

  const result = await checkStudentTickets('student@university.edu');

  expect(result).toEqual({
    hasOutstandingTickets: false,
    outstandingCount: 0,
    totalOwed: 0,
    tickets: []
  });
});

it('should handle missing data in the response', async () => {
  mockFetch.mockResolvedValue({
    json: vi.fn().mockResolvedValue({
      data: {}
    })
  });

  const result = await checkStudentTickets('student@university.edu');

  expect(result).toEqual({
    hasOutstandingTickets: false,
    outstandingCount: 0,
    totalOwed: 0,
    tickets: []
  });
});

it('should handle network errors', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'));

  await expect(checkStudentTickets('student@university.edu'))
    .rejects
    .toThrow('Failed to check student tickets');
});

it('should handle unexpected response format', async () => {
  mockFetch.mockResolvedValue({
    json: vi.fn().mockResolvedValue({
      errors: [{ message: 'GraphQL error' }]
    })
  });

  const result = await checkStudentTickets('student@university.edu');

  expect(result).toEqual({
    hasOutstandingTickets: false,
    outstandingCount: 0,
    totalOwed: 0,
    tickets: []
  });
});