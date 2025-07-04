import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as actions from '@/app/[locale]/ticket/actions';
import { ticketService, vehicleService } from '@/verify/service';
import { Ticket, Vehicle } from '@/verify/index';

vi.mock('@/verify/service', () => ({
  vehicleService: {
    getVehicles: vi.fn(),
  },
  ticketService: {
    getTickets: vi.fn(),
    challengeTicket: vi.fn(),
  },
}));

vi.mock('@/auth/service', () => ({
  verifyAuth: vi.fn(),
}));

let mockCookieValue: string | undefined = 'mock-token';

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => (mockCookieValue ? { value: mockCookieValue } : undefined),
  }),
}));

const mockTicket: Ticket = {
  id: 't1',
  vehicle: 'v1',
  cost: 20,
  issued: '2024-01-01T00:00:00Z',
  deadline: '2024-02-01T00:00:00Z',
  status: 'challenged',
};

const mockVehicle: Vehicle = {
  id: '1',
  make: 'Toyota',
  model: 'Camry',
  plate: '7ABC123',
  year: 2020,
  color: 'Blue',
  state: 'CA',
};

describe('ticket/actions.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieValue = 'mock-token';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('getVehicles returns vehicles on success', async () => {
    vi.mocked(vehicleService.getVehicles).mockResolvedValue([mockVehicle]);
    const result = await actions.getVehicles();
    expect(result).toEqual([mockVehicle]);
  });

  it('getVehicles handles missing token', async () => {
    mockCookieValue = undefined;
    const result = await actions.getVehicles();
    expect(result).toBeUndefined();
  });

  it('getVehicles handles service error', async () => {
    vi.mocked(vehicleService.getVehicles).mockRejectedValue(new Error('Service failure'));
    const result = await actions.getVehicles();
    expect(result).toBeUndefined();
  });

  it('getTickets returns tickets on success', async () => {
    vi.mocked(ticketService.getTickets).mockResolvedValue([mockTicket]);
    const result = await actions.getTickets('v1');
    expect(result).toEqual([mockTicket]);
  });

  it('getTickets handles missing token', async () => {
    mockCookieValue = undefined;
    const result = await actions.getTickets('v1');
    expect(result).toBeUndefined();
  });

  it('getTickets handles service error', async () => {
    vi.mocked(ticketService.getTickets).mockRejectedValue(new Error('Ticket fetch fail'));
    const result = await actions.getTickets('v1');
    expect(result).toBeUndefined();
  });

  it('challengeTicket returns ticket on success', async () => {
    vi.mocked(ticketService.challengeTicket).mockResolvedValue(mockTicket);
    const result = await actions.challengeTicket('t1', 'desc');
    expect(result).toEqual(mockTicket);
  });

  it('challengeTicket handles missing token', async () => {
    mockCookieValue = undefined;
    const result = await actions.challengeTicket('t1', 'desc');
    expect(result).toBeUndefined();
  });

  it('challengeTicket handles service error', async () => {
    vi.mocked(ticketService.challengeTicket).mockRejectedValue(new Error('Challenge failed'));
    const result = await actions.challengeTicket('t1', 'desc');
    expect(result).toBeUndefined();
  });
});
