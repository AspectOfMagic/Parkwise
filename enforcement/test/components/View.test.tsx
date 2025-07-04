import { it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import EnforcementPage from '../../src/app/home/View';

afterEach(() => {
  cleanup();
})

vi.mock('server-only', () => ({}));

vi.mock('../../src/app/login/actions', () => ({
  logout: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useServerInsertedHTML: vi.fn(),
}))

it('renders the ParkWise Enforcement header text', () => {
  render(<EnforcementPage />);

  expect(screen.getByText('ParkWise Enforcement')).toBeDefined();
});

it('handles logout', async () => {
  const { logout } = await import('../../src/app/login/actions');

  render(<EnforcementPage />);

  const logoutButton = screen.getByLabelText('logout-button');

  await fireEvent.click(logoutButton);

  expect(logout).toHaveBeenCalled();
});