import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'

import Page from '../../src/app/login/page'
import { login } from '../../src/app/login/actions'

vi.mock('server-only', () => ({}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}))

vi.mock('../../src/app/login/actions', () => ({
  login: vi.fn().mockResolvedValue({
    success: true,
    name: 'Test User',
    accessToken: 'test-token'
  })
}))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup();
})

const AppRouterContextProvider = ({ children }: { children: ReactNode }) => {
  return children
}

it('displays the parking enforcement login page', () => {
  render(
    <AppRouterContextProvider>
      <Page />
    </AppRouterContextProvider>
  )

  expect(screen.getByText('Sign in to your enforcer dashboard')).toBeDefined()
})

it('allows users to type credentials and submit the login form', async () => {
  const user = userEvent.setup()

  render(
    <AppRouterContextProvider>
      <Page />
    </AppRouterContextProvider>
  )

  await user.tab()
  await user.keyboard('enforcer@example.com')

  await user.tab()
  await user.keyboard('password123')

  await user.tab()
  await user.keyboard(' ')

  expect(login).toHaveBeenCalledWith({
    email: 'enforcer@example.com',
    password: 'password123'
  })

  expect(mockPush).toHaveBeenCalledWith('/')
})

it('handles login failure gracefully', async () => {
  (login as any).mockRejectedValueOnce(new Error("Authentication failed"));

  const user = userEvent.setup()
  const consoleSpy = vi.spyOn(console, 'log');

  render(
    <AppRouterContextProvider>
      <Page />
    </AppRouterContextProvider>
  )

  await user.tab()
  await user.keyboard('wrong@example.com')

  await user.tab()
  await user.keyboard('wrongpassword')

  await user.tab()
  await user.keyboard(' ')

  expect(login).toHaveBeenCalledWith({
    email: 'wrong@example.com',
    password: 'wrongpassword'
  })

  expect(mockPush).not.toHaveBeenCalled()

  expect(consoleSpy).toHaveBeenCalled()

  // Clean up the console spy
  consoleSpy.mockRestore()
})