import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TopBar from '@/app/components/TopBar'
import React from 'react'
import { logout } from '@/app/login/actions';

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('js-cookie', () => ({ set: vi.fn() }))
vi.mock('@mui/icons-material/Logout', () => ({
  __esModule: true,
  default: () => <div>LogoutIcon</div>,
}))
vi.mock('@/app/login/actions', () => ({
  logout: vi.fn(() => Promise.resolve()),
}))

beforeEach(() => {
  sessionStorage.setItem('name', 'Yoyo Jaber')
})

afterEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

describe('TopBar', () => {
  it('renders the brand and user name', () => {
    render(<TopBar />)

    expect(screen.getByText('@ ParkWise')).toBeTruthy()
    expect(screen.getByText('Yoyo Jaber')).toBeTruthy()
    expect(screen.getByText('Admin')).toBeTruthy()
  })
  it('opens the user menu when avatar is clicked', async () => {
    render(<TopBar />);

    // Get all buttons and find the one with the aria-label
    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) =>
      btn.getAttribute('aria-label') === 'Open account menu'
    );

    expect(avatarButton).toBeDefined(); // safety check
    fireEvent.click(avatarButton!);     // non-null assertion since we just checked

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeTruthy();
    });
  });
  it('logs out and closes the menu when logout is clicked', async () => {
    render(<TopBar />);

    // Open the menu
    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons.find((btn) =>
      btn.getAttribute('aria-label') === 'Open account menu'
    );

    fireEvent.click(avatarButton!);

    // Click the logout item
  const logoutItems = await screen.findAllByText('Logout');
  fireEvent.click(logoutItems[logoutItems.length - 1]); // click the last one


    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(sessionStorage.getItem('name')).toBeNull();
    });
  });

})
