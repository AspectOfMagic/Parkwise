import { it, expect, beforeEach, vi } from 'vitest';

import { vehicleService, permitService, ticketService } from '../../src/verify/service';
import { Vehicle, BackendTicket } from '../../src/verify/index';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
  vi.clearAllMocks();
});

it('should fetch vehicle information by license plate', async () => {
  const mockVehicle: Vehicle = {
    id: '12345678-1234-1234-1234-123456789abc',
    plate: 'ABC123',
    make: 'Toyota',
    model: 'Camry',
    ownerId: '98765432-9876-9876-9876-987654321def'
  };

  // Mock GraphQL response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: {
        GetByPlate: mockVehicle
      }
    })
  });

  const result = await vehicleService.getByLicensePlate('ABC123', 'CA', 'valid-token');

  // Verify fetch was called correctly with GraphQL query
  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:4000/graphql',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: expect.stringContaining('GetByPlate')
    }
  );

  // Verify result matches expected vehicle data
  expect(result).toEqual(mockVehicle);
});

it('should throw an error when vehicle GraphQL query fails', async () => {
  // Mock error response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      errors: [{ message: 'Vehicle not found' }]
    })
  });

  await expect(vehicleService.getByLicensePlate('UNKNOWN', 'valid-token'))
    .rejects.toThrow('Vehicle not found');

  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:4000/graphql',
    expect.anything()
  );
});

it('should check permit validity by license plate', async () => {
  const licensePlate = 'ABC123';
  const state = 'CA';
  const mockPermitCheck = {
    valid: true,
    vehicleId: '12345678-1234-1234-1234-123456789abc'
  };

  // Mock GraphQL response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: {
        CheckByVehicle: mockPermitCheck
      }
    })
  });

  const result = await permitService.checkValidity(licensePlate, state, 'valid-token');

  // Verify fetch was called correctly with GraphQL query
  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:4002/graphql', // Note: Uses PERMIT_URL instead of VEHICLE_URL
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
        'plate': licensePlate,
        'state': state
      },
      body: expect.stringContaining('CheckByVehicle')
    }
  );

  // Verify result matches expected permit check data
  expect(result).toEqual(mockPermitCheck);
});

it('should throw an error when permit GraphQL query fails', async () => {
  const licensePlate = 'ABC123';
  const state = 'CA';

  // Mock error response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      errors: [{ message: 'No permit found for this vehicle' }]
    })
  });

  await expect(permitService.checkValidity(licensePlate, state, 'valid-token'))
    .rejects.toThrow('No permit found for this vehicle');

  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:4002/graphql',
    expect.anything()
  );
});

it('should create a new ticket', async () => {
  const newTicket = {
    vehicle: '12345678-1234-1234-1234-123456789abc',
    cost: 50
  };

  const createdTicket: BackendTicket = {
    id: '99998888-7777-6666-5555-444433332222',
    vehicle: '12345678-1234-1234-1234-123456789abc',
    cost: 50,
    issued: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000).toISOString(),
    status: 'unpaid'
  };

  // Mock GraphQL response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: {
        makeTicket: createdTicket
      }
    })
  });

  const result = await ticketService.create(newTicket, 'valid-token');

  // Verify fetch was called correctly with GraphQL mutation
  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:4001/graphql',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: expect.stringContaining('makeTicket')
    }
  );

  // Verify result matches expected ticket data
  expect(result).toEqual(createdTicket);
});

