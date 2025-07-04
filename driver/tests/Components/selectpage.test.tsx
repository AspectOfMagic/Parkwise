import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectVehiclePage from '@/app/[locale]/permit/SelectVehicle/page';
import * as vehicleActions from '@/app/[locale]/permit/SelectVehicle/action';
import { useRouter } from 'next/navigation';
import { useTranslations as mockUseTranslations } from 'next-intl';

vi.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    set: vi.fn(),
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

describe('SelectVehiclePage', () => {
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

  it('renders vehicles and allows selection', async () => {
    render(<SelectVehiclePage />);

    await waitFor(() => {
      expect(screen.getByText('permit.text2')).not.toBeNull();
      expect(screen.getByLabelText('Toyota — ABC123')).not.toBeNull();
      expect(screen.getByLabelText('Honda — XYZ789')).not.toBeNull();
    });

    const abcCheckbox = screen.getByLabelText('Toyota — ABC123') as HTMLInputElement;
    expect(abcCheckbox.checked).toBe(false);
    await userEvent.click(abcCheckbox);
    expect(abcCheckbox.checked).toBe(true);

    expect(Cookies.set).toHaveBeenCalledWith(
      'plate',
      'ABC123',
      expect.objectContaining({ path: '/', sameSite: 'Lax' })
    );
  });
});
