import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectVehiclePage from '@/app/[locale]/permit/SelectVehicle/page';
import * as vehicleActions from '@/app/[locale]/permit/SelectVehicle/action';
import { useRouter } from 'next/navigation';
import { useTranslations as mockUseTranslations } from 'next-intl';

vi.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    set: vi.fn(),
    get: vi.fn(() => undefined), // prevent cookie preselection
  },
}));

import Cookies from 'js-cookie';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/app/[locale]/home/Header', () => ({
  default: () => <div>MockHeader</div>,
}));

vi.mock('@/app/[locale]/footer', () => ({
  default: () => <div>MockFooter</div>,
}));

interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: number;
  color: string;
  state: string;
}

describe('SelectVehiclePage toggle logic', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
    (mockUseTranslations as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (ns: string) => (key: string) => `${ns}.${key}`
    );

    vi.spyOn(vehicleActions, 'getVehicles').mockResolvedValue([
      {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        plate: 'ABC123',
        year: 2020,
        color: 'Silver',
        state: 'CA',
      },
      {
        id: '2',
        make: 'Honda',
        model: 'Civic',
        plate: 'XYZ789',
        year: 2021,
        color: 'Black',
        state: 'CA',
      },
    ] as Vehicle[]);
  });

  it('selects, unselects, and switches vehicle (cover toggle logic)', async () => {
    render(<SelectVehiclePage />);

    const abc = await screen.findByLabelText('Toyota — ABC123') as HTMLInputElement;
    const xyz = await screen.findByLabelText('Honda — XYZ789') as HTMLInputElement;

    // Initially unchecked
    expect(abc.checked).toBe(false);
    expect(xyz.checked).toBe(false);

    await userEvent.click(abc);
    expect(abc.checked).toBe(true);
    expect(Cookies.set).toHaveBeenCalledWith(
      'plate',
      'ABC123',
      expect.objectContaining({ path: '/', sameSite: 'Lax' })
    );

    await userEvent.click(abc);
    expect(abc.checked).toBe(false);

    await userEvent.click(xyz);
    expect(xyz.checked).toBe(true);
    expect(Cookies.set).toHaveBeenCalledWith(
      'plate',
      'XYZ789',
      expect.objectContaining({ path: '/', sameSite: 'Lax' })
    )

    expect((Cookies.set as Mock).mock.calls.length).toBe(6);
  });
  it('navigates to checkout when the checkout button is clicked', async () => {
    render(<SelectVehiclePage />);

    const abc = await screen.findByLabelText('Toyota — ABC123') as HTMLInputElement;

    // Select vehicle
    await userEvent.click(abc);
    expect(abc.checked).toBe(true);

    // Find checkout button
    const checkoutButton = await screen.findByTestId('checkout-button');

    // Click it
    await userEvent.click(checkoutButton);
    expect(mockPush).toHaveBeenCalledWith('/permit/checkout');
  });
});
