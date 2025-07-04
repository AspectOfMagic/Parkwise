import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vehicleService, ticketService } from '@/verify/service';

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

function mockGraphQL(data: any) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    json: () => Promise.resolve({ data }),
  } as Response);
}

it('getVehicles returns list of vehicles', async () => {
  const mockData = { GetMyVehicles: [{ id: 'v1', plate: 'ABC123' }] };
  mockGraphQL(mockData);

  const result = await vehicleService.getVehicles('token123');
  expect(result).toEqual(mockData.GetMyVehicles);
});

it('registerVehicle returns a new vehicle', async () => {
  const mockData = {
    RegisterVehicle: {
      id: 'v2',
      make: 'Tesla',
      model: '3',
      plate: 'EV123'
    }
  };
  mockGraphQL(mockData);

  const result = await vehicleService.registerVehicle(
    'Tesla',    // make
    '3',        // model
    'EV123',    // plate
    '2024',     // year
    'black',    // color
    'CA',       // state
    'token123'  // token
  );

  expect(result).toEqual(mockData.RegisterVehicle);
});

it('deleteVehicle returns deleted vehicle object', async () => {
  const mockData = {
    DeleteMyVehicle: {
      id: 'v3',
      make: 'Toyota',
      model: 'Corolla',
      plate: 'OLD123'
    }
  };
  mockGraphQL(mockData);

  const result = await vehicleService.deleteVehicle('OLD123', 'CA', 'token123');
  expect(result).toEqual(mockData.DeleteMyVehicle);
});

it('getTickets returns list of tickets for a vehicle', async () => {
  const mockData = { getTickets: [{ id: 't1', cost: 50 }] };
  mockGraphQL(mockData);

  const result = await ticketService.getTickets('vehicle-id', 'token123');
  expect(result).toEqual(mockData.getTickets);
});

it('getTicketById returns ticket by ID', async () => {
  const mockData = { getTicketById: [{ id: 't2', cost: 100 }] };
  mockGraphQL(mockData);

  const result = await ticketService.getTicketById('t2', 'token123');
  expect(result).toEqual(mockData.getTicketById);
});

it('payTicket returns updated ticket', async () => {
  const mockData = { payTicket: { id: 't3', cost: 100, status: 'paid' } };
  mockGraphQL(mockData);

  const result = await ticketService.payTicket('t3', 'token123');
  expect(result).toEqual(mockData.payTicket);
});

it('throws if fetchGraphQL fails in getVehicles', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ errors: [{ message: 'GraphQL failed' }] }),
  });

  await expect(vehicleService.getVehicles('token123')).rejects.toThrow('GraphQL failed');
});

it('challengeTicket returns updated challenged ticket', async () => {
  const mockData = {
    challengeTicket: {
      id: 't4',
      cost: 75,
      issued: '2025-06-01T12:00:00.000Z',
      deadline: '2025-06-10T12:00:00.000Z',
      status: 'challenged',
    },
  };

  mockGraphQL(mockData);

  const result = await ticketService.challengeTicket('t4', 'I was wrongly ticketed.', 'token123');
  expect(result).toEqual(mockData.challengeTicket);
});
