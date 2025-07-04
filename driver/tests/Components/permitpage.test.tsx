import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PermitPage from '@/app/[locale]/permit/page';
import * as permitActions from '@/app/[locale]/permit/action';
import { useRouter } from 'next/navigation';
import { useTranslations as mockUseTranslations } from 'next-intl';

vi.mock('js-cookie', () => {
  return {
    __esModule: true,
    default: {
      set: vi.fn(),
    },
  };
});

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

describe('PermitPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });

    (mockUseTranslations as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (ns: string) => (key: string) => `${ns}.${key}`
    );

    vi.spyOn(permitActions, 'getPermits').mockResolvedValue([
      { id: '1', classname: 'Student', type: 'A', price: 100 },
      { id: '2', classname: 'Faculty', type: 'B', price: 200 },
    ]);
  });

  it('renders permits and selects one', async () => {
    render(<PermitPage />);

    await waitFor(() => {
      expect(screen.queryByText('Student - A')).not.toBeNull();
      expect(screen.queryByText('$100')).not.toBeNull();
    });
    const radios = screen.getAllByLabelText('Student - A');
    const radio = radios.find(r => (r as HTMLInputElement).type === 'radio');
    expect(radio).toBeDefined();
    await userEvent.click(radio!);

    expect(Cookies.set).toHaveBeenCalledWith('permit', '1', expect.any(Object));

    const button = screen.getByRole('button', { name: /button.select/i });
    expect(button.hasAttribute('disabled')).toBe(false);
  });

    it('navigates on button click', async () => {
    render(<PermitPage />);

    const radios = await screen.findAllByLabelText('Student - A');
    const radio = radios.find((el) => (el as HTMLInputElement).type === 'radio');
    expect(radio).toBeDefined();
    await userEvent.click(radio!);

    const buttons = screen.getAllByRole('button', { name: /button.select/i });
    const enabledButton = buttons.find((btn) => !btn.hasAttribute('disabled'));
    expect(enabledButton).toBeDefined();

    await userEvent.click(enabledButton!);
    expect(mockPush).toHaveBeenCalledWith('/permit/SelectVehicle');
    });

});
