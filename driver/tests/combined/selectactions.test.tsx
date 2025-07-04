import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getVehicles } from '@/app/[locale]/permit/SelectVehicle/action';
import { cookies } from 'next/headers';
import { vehicleService } from '@/verify/service';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/verify/service', () => ({
  vehicleService: {
    getVehicles: vi.fn(),
  },
}));

const mockCookieStore = {
  get: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('getVehicles', () => {
  it('returns undefined if no session token is found', async () => {
    (cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      get: vi.fn(() => undefined),
    });

    const result = await getVehicles();
    expect(result).toBeUndefined();
  });

  it('returns vehicle data if session token is valid and service call succeeds', async () => {
    (cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      get: vi.fn(() => ({ value: 'mock-token' })),
    });

    const mockVehicles = [
      { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020 },
      { id: 'v2', make: 'Tesla', model: 'Model 3', year: 2023 },
    ];

    (vehicleService.getVehicles as ReturnType<typeof vi.fn>).mockResolvedValue(mockVehicles);

    const result = await getVehicles();
    expect(vehicleService.getVehicles).toHaveBeenCalledWith('mock-token');
    expect(result).toEqual(mockVehicles);
  });

  it('returns undefined if vehicleService throws error', async () => {
    (cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      get: vi.fn(() => ({ value: 'mock-token' })),
    });

    (vehicleService.getVehicles as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Service Error'));

    const result = await getVehicles();
    expect(result).toBeUndefined();
  });
});
