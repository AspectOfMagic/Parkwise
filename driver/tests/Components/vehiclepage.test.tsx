import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehiclePage from '@/app/[locale]/vehicle/page';
import * as vehicleActions from '@/app/[locale]/vehicle/actions';
import { useRouter } from 'next/navigation';
import { useTranslations as mockUseTranslations } from 'next-intl';

vi.mock('server-only', () => ({}));


// Router + Translation Mocks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

// Header mock (if you use it)
vi.mock('@/app/[locale]/home/Header', () => ({
  default: () => <div>MockHeader</div>,
}));

const mockPush = vi.fn();

describe('VehiclePage', () => {
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
    ]);


    vi.spyOn(vehicleActions, 'deleteVehicle').mockResolvedValue(undefined);
  });

  it('renders vehicle and handles delete and register', async () => {
    render(<VehiclePage />);

    await waitFor(() => {
      expect(screen.getByText('Toyota')).toBeDefined();
      expect(screen.getByText('ABC123')).toBeDefined();
    });

    // Click delete
    fireEvent.click(screen.getByLabelText('remove vehicle'));
    await waitFor(() => {
      expect(vehicleActions.deleteVehicle).toHaveBeenCalledWith('ABC123', 'CA');
    });
    const buttons = screen.getAllByRole('button');
    const addButton = buttons[buttons.length - 1];
    fireEvent.click(addButton);
    expect(mockPush).toHaveBeenCalledWith('/vehicle/register');

  });
});
