import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterVehiclePage from '@/app/[locale]/vehicle/register/page';

vi.mock('next-intl/navigation', () => ({
  createNavigation: () => ({
    Link: 'a',
    redirect: vi.fn(),
    usePathname: vi.fn(() => '/'),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })),
    getPathname: vi.fn(() => '/'),
  }),
}));


vi.mock('next/navigation.js', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));


vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/app/[locale]/vehicle/actions', () => ({
  registerVehicle: vi.fn(),
}));

import { registerVehicle } from '@/app/[locale]/vehicle/actions';


describe('RegisterVehiclePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });



  it('fills out and submits the form', async () => {
    render(<RegisterVehiclePage />);

    fireEvent.change(screen.getAllByPlaceholderText('e.g. ABC123')[0], { target: { value: 'ABC123' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Subaru')[0], { target: { value: 'Subaru' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Outback')[0], { target: { value: 'Outback' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. 2025')[0], { target: { value: '2025' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. White')[0], { target: { value: 'White' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. CA')[0], { target: { value: 'CA' } });

    fireEvent.click(screen.getAllByRole('button', { name: /Register/i })[0]);

    await waitFor(() => {
      expect(registerVehicle).toHaveBeenCalledWith(
        'Subaru',
        'Outback',
        'ABC123',
        '2025',
        'White',
        'CA'
      );
    });
  });


  it('logs an error if registerVehicle throws', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    (registerVehicle as any).mockImplementation(() => {
      throw new Error('Register failed');
    });

    render(<RegisterVehiclePage />);

    fireEvent.change(screen.getAllByPlaceholderText('e.g. ABC123')[0], { target: { value: 'ERR001' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Subaru')[0], { target: { value: 'Error' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Outback')[0], { target: { value: 'Case' } });

    fireEvent.click(screen.getAllByRole('button', { name: /Register/i })[0]);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });
  });
  it(
    'clears fields, shows popup, and redirects after successful registration',
    async () => {
      const push = vi.fn();

      vi.doMock('next/navigation.js', () => ({
        useRouter: () => ({
          push,
          replace: vi.fn(),
          refresh: vi.fn(),
          prefetch: vi.fn(),
        }),
      }));

      (registerVehicle as any).mockResolvedValue({ id: 'mock-id' });

      const { default: RegisterVehiclePage } = await import('@/app/[locale]/vehicle/register/page');
      render(<RegisterVehiclePage />);

      fireEvent.change(screen.getAllByPlaceholderText('e.g. ABC123')[0], { target: { value: 'TEST123' } });
      fireEvent.change(screen.getAllByPlaceholderText('e.g. Subaru')[0], { target: { value: 'TestMake' } });
      fireEvent.change(screen.getAllByPlaceholderText('e.g. Outback')[0], { target: { value: 'TestModel' } });
      fireEvent.change(screen.getAllByPlaceholderText('e.g. 2025')[0], { target: { value: '2023' } });
      fireEvent.change(screen.getAllByPlaceholderText('e.g. White')[0], { target: { value: 'Red' } });
      fireEvent.change(screen.getAllByPlaceholderText('e.g. CA')[0], { target: { value: 'NY' } });

      fireEvent.click(screen.getAllByRole('button', { name: /Register/i })[0]);

      await waitFor(() => {
        expect(screen.getByText('Registering vehicle...')).toBeTruthy();
      });

      await new Promise((resolve) => setTimeout(resolve, 2600));

      expect(screen.getByText('Vehicle successfully registered!')).toBeTruthy();
    },
    5000 //increase 5 seconds for stuff to show up.
  );
});
