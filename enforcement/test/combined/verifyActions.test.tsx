import { it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';
import { checkVehiclePermit, issueTicket } from '../../src/app/home/actions';
import { vehicleService, permitService, ticketService } from '../../src/verify/service';
import { verifyAuth } from '../../src/auth/service';
import { UUID, Vehicle } from '../../src/verify/index';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('../../src/verify/service', () => ({
  vehicleService: {
    getByLicensePlate: vi.fn(),
  },
  permitService: {
    checkValidity: vi.fn(),
  },
  ticketService: {
    create: vi.fn(),
  },
}));

vi.mock('../../src/auth/service', () => ({
  verifyAuth: vi.fn(),
}));


const mockCookieStore = {
  get: vi.fn().mockReturnValue({ value: 'mock-token' }),
};

const mockVehicle: Vehicle = {
  id: '12345678-1234-1234-1234-123456789abc',
  plate: 'ABC123',
  make: 'Toyota',
  model: 'Camry',
  ownerId: '98765432-9876-9876-9876-987654321def'
};

beforeEach(() => {
  vi.clearAllMocks();

  (cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockCookieStore);

  (verifyAuth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: 'enforcer-123',
    role: 'enforcer'
  });
});

it('should return valid permit status when vehicle has a valid permit', async () => {
  (vehicleService.getByLicensePlate as ReturnType<typeof vi.fn>).mockResolvedValue(mockVehicle);
  (permitService.checkValidity as ReturnType<typeof vi.fn>).mockResolvedValue({
    vehicleId: mockVehicle.id,
    valid: true
  });

  const result = await checkVehiclePermit('ABC123', 'CA');

  expect(result.vehicle).toEqual(mockVehicle);
  expect(result.hasValidPermit).toBe(true);
  expect(result.message).toBe('Vehicle has a valid permit');
  expect(vehicleService.getByLicensePlate).toHaveBeenCalledWith('ABC123', 'CA', 'mock-token');
  expect(permitService.checkValidity).toHaveBeenCalledWith('ABC123', 'CA', 'mock-token');
});

it('should return invalid permit status when permit is expired', async () => {
  (vehicleService.getByLicensePlate as ReturnType<typeof vi.fn>).mockResolvedValue(mockVehicle);
  (permitService.checkValidity as ReturnType<typeof vi.fn>).mockResolvedValue({
    vehicleId: mockVehicle.id,
    valid: false
  });

  const result = await checkVehiclePermit('ABC123', 'CA');

  expect(result.hasValidPermit).toBe(false);
  expect(result.message).toBe('No valid permit found for this vehicle');
});

it('should return invalid permit status when permit is not yet active', async () => {
  (vehicleService.getByLicensePlate as ReturnType<typeof vi.fn>).mockResolvedValue(mockVehicle);
  (permitService.checkValidity as ReturnType<typeof vi.fn>).mockResolvedValue({
    vehicleId: mockVehicle.id,
    valid: false
  });

  const result = await checkVehiclePermit('ABC123', 'CA');

  expect(result.hasValidPermit).toBe(false);
  expect(result.message).toBe('No valid permit found for this vehicle');
});

it('should return invalid permit status when permit is deleted', async () => {
  (vehicleService.getByLicensePlate as ReturnType<typeof vi.fn>).mockResolvedValue(mockVehicle);
  (permitService.checkValidity as ReturnType<typeof vi.fn>).mockResolvedValue({
    vehicleId: mockVehicle.id,
    valid: false
  });

  const result = await checkVehiclePermit('ABC123', 'CA');

  expect(result.hasValidPermit).toBe(false);
  expect(result.message).toBe('No valid permit found for this vehicle');
});

it('should handle vehicle with no permit', async () => {
  (vehicleService.getByLicensePlate as ReturnType<typeof vi.fn>).mockResolvedValue(mockVehicle);
  (permitService.checkValidity as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('No permit found'));

  const result = await checkVehiclePermit('ABC123', 'CA');

  expect(result.vehicle).toEqual(mockVehicle);
  expect(result.hasValidPermit).toBe(false);
  expect(result.message).toBe('Unable to verify permit status');
});

it('should handle vehicle not found', async () => {
  (vehicleService.getByLicensePlate as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Vehicle not found'));

  const result = await checkVehiclePermit('XYZ789', 'CA');

  expect(result.vehicle).toBeNull();
  expect(result.hasValidPermit).toBe(false);
  expect(result.message).toBe('Vehicle not found in the system');
});

it('should throw error when authentication fails', async () => {
  (verifyAuth as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unauthorized'));

  await expect(checkVehiclePermit('ABC123', 'CA')).rejects.toThrow('Unauthorized or service unavailable');
});

const ticketData = {
  licensePlate: 'ABC123',
  location: 'Parking Lot A',
  violation: 'No Valid Permit',
  amount: 50,
  vehicleId: '12345678-1234-1234-1234-123456789abc' as UUID
};

const mockBackendTicket = {
  id: '98765432-9876-9876-9876-987654321fed',
  vehicle: ticketData.vehicleId,
  cost: ticketData.amount,
  issued: expect.any(String),
  deadline: expect.any(String),
  status: 'unpaid'
};

// The ticket tests don't need to be changed since they match the implementation
it('should successfully issue a ticket', async () => {
  (ticketService.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockBackendTicket);

  const result = await issueTicket(ticketData);

  expect(result.success).toBe(true);
  expect(result.ticket).toEqual({
    id: mockBackendTicket.id,
    vehicleId: mockBackendTicket.vehicle,
    licensePlate: ticketData.licensePlate,
    timestamp: mockBackendTicket.issued,
    location: ticketData.location,
    violation: ticketData.violation,
    amount: mockBackendTicket.cost,
    isPaid: false,
    enforcerId: 'enforcer-123'
  });
  expect(result.message).toBe('Ticket issued successfully');
});

it('should handle unauthorized users', async () => {
  (verifyAuth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

  const result = await issueTicket(ticketData);

  expect(result.success).toBe(false);
  expect(result.message).toBe('Unauthorized - not logged in');
  expect(ticketService.create).not.toHaveBeenCalled();
});

it('should handle errors when creating tickets', async () => {
  (ticketService.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to create ticket'));

  const result = await issueTicket(ticketData);

  expect(result.success).toBe(false);
  expect(result.message).toBe('Failed to issue ticket');
});