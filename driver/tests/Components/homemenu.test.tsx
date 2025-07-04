import { it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeMenu from '@/app/[locale]/home/Home';
import { logout } from '@/app/[locale]/login/actions';
// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock translations
vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string) => {
      const messages: Record<string, string> = {
        text1: 'Hi',
        text3: 'Contact Information',
        text4: 'Vehicles',
        text5: 'Order Permits',
        text6: 'Pay Ticket',
      };
      return messages[key] || key;
    };
  },
}));

vi.mock('@/app/[locale]/login/actions', () => ({
  logout: vi.fn(),
}));


beforeEach(() => {
  sessionStorage.clear();
  mockPush.mockReset();
});

afterEach(() => {
  cleanup();
});

it('renders user name and menu options correctly', () => {
  sessionStorage.setItem('name', 'Yoyo User');
  render(<HomeMenu />);

  expect(screen.getAllByText('Hi, Yoyo User')[0]).toBeDefined();
  expect(screen.getByText('Contact Information')).toBeDefined();
  expect(screen.getByText('Vehicles')).toBeDefined();
  expect(screen.getByText('Order Permits')).toBeDefined();
  expect(screen.getByText('Pay Ticket')).toBeDefined();
});

it('navigates to account page when Contact Information is clicked', () => {
  sessionStorage.setItem('name', 'Yoyo User');
  render(<HomeMenu />);

  fireEvent.click(screen.getByText('Contact Information'));
  expect(mockPush).toHaveBeenCalledWith('/account');
});

it('clears sessionStorage and calls logout when Logout button is clicked', async () => {
  sessionStorage.setItem('name', 'Yoyo User');

  render(<HomeMenu />);

  const logoutButton = await screen.findByRole('button', { name: /logout/i });
  await userEvent.click(logoutButton);

  expect(sessionStorage.getItem('name')).toBeNull();
  expect(logout).toHaveBeenCalled();
});
