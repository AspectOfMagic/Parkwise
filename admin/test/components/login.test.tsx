import { it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'

import { login } from '../../src/app/login/actions';
import Page from '../../src/app/login/page'

vi.mock('server-only', () => ({}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}))

vi.mock('../../src/app/login/actions', () => ({
  login: vi.fn()
}))

afterEach(() => {
  cleanup();
	vi.clearAllMocks();
});

const AppRouterContextProvider = ({ children }: { children: ReactNode }) => {
  return children
}

it('displays the parking enforcement login page', () => {
  render(
    <AppRouterContextProvider>
      <Page />
    </AppRouterContextProvider>
  )

  expect(screen.getByText('Sign In')).toBeDefined()
})

it('allows users to enter credentials and click login', async () => {
  (login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: true });

  render(
    <AppRouterContextProvider>
      <Page />
    </AppRouterContextProvider>
  )

  const user = userEvent.setup()

  const emailInput = screen.getByPlaceholderText('Enter your email')
  const passwordInput = screen.getByPlaceholderText('Enter your password')
  const loginButton = screen.getByLabelText('login-button')

  await user.type(emailInput, 'test@example.com')
  await user.type(passwordInput, 'password123')

  await user.click(loginButton)

  expect(login).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  })
})

it('handles login error correctly', async () => {
  (login as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed login'));

  render(
    <AppRouterContextProvider>
      <Page />
    </AppRouterContextProvider>
  )

  const user = userEvent.setup()

  const emailInput = screen.getByPlaceholderText('Enter your email')
  const passwordInput = screen.getByPlaceholderText('Enter your password')
  const loginButton = screen.getByLabelText('login-button')

  await user.type(emailInput, 'test@example.com')
  await user.type(passwordInput, 'password123')

  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  await user.click(loginButton)

  expect(login).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  })

  expect(consoleSpy).toHaveBeenCalled()

  consoleSpy.mockRestore()
})
