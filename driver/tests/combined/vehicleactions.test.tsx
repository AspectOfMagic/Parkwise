import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as actions from '@/app/[locale]/vehicle/actions';
import { vehicleService } from '@/verify/service';
import { Vehicle } from '@/verify/index';

// Token controller
let mockCookieValue: string | undefined = 'mock-token';

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => (mockCookieValue ? { value: mockCookieValue } : undefined),
  }),
}));

vi.mock('@/verify/service', () => ({
  vehicleService: {
    getVehicles: vi.fn(),
    registerVehicle: vi.fn(),
    deleteVehicle: vi.fn(),
  },
}));

vi.mock('@/auth/service', () => ({
  verifyAuth: vi.fn(),
}));

const mockVehicle: Vehicle = {
  id: '1',
  make: 'Honda',
  model: 'Civic',
  plate: '8XYZ789',
  year: 2022,
  color: 'Black',
  state: 'CA',
};

describe('vehicle/actions.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieValue = 'mock-token';
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // getVehicles
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

  it('getVehicles handles service failure', async () => {
    vi.mocked(vehicleService.getVehicles).mockRejectedValue(new Error('fail'));
    const result = await actions.getVehicles();
    expect(result).toBeUndefined();
  });

  // registerVehicle
  it('registerVehicle returns vehicle on success', async () => {
    vi.mocked(vehicleService.registerVehicle).mockResolvedValue(mockVehicle);
    const result = await actions.registerVehicle('Honda', 'Civic', '8XYZ789', '2022', 'Black', 'CA');
    expect(result).toEqual(mockVehicle);
  });

  it('registerVehicle handles missing token', async () => {
    mockCookieValue = undefined;
    const result = await actions.registerVehicle('H', 'C', 'P', '2022', 'B', 'CA');
    expect(result).toBeUndefined();
  });

  it('registerVehicle handles service failure', async () => {
    vi.mocked(vehicleService.registerVehicle).mockRejectedValue(new Error('fail'));
    const result = await actions.registerVehicle('H', 'C', 'P', '2022', 'B', 'CA');
    expect(result).toBeUndefined();
  });

  // deleteVehicle
  it('deleteVehicle returns vehicle on success', async () => {
    vi.mocked(vehicleService.deleteVehicle).mockResolvedValue(mockVehicle);
    const result = await actions.deleteVehicle('8XYZ789', 'CA');
    expect(result).toEqual(mockVehicle);
  });

  it('deleteVehicle handles missing token', async () => {
    mockCookieValue = undefined;
    const result = await actions.deleteVehicle('8XYZ789', 'CA');
    expect(result).toBeUndefined();
  });

  it('deleteVehicle handles service failure', async () => {
    vi.mocked(vehicleService.deleteVehicle).mockRejectedValue(new Error('fail'));
    const result = await actions.deleteVehicle('8XYZ789', 'CA');
    expect(result).toBeUndefined();
  });
});
