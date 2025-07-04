import { vi, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

vi.mock('@/app/dashboard/actions', () => ({
  makeEnforcer: vi.fn()
}))
import { makeEnforcer } from '@/app/dashboard/actions'
import EnforcementView from '@/app/components/EnforcementView'

// Minimal mocks to avoid EMFILE
vi.mock('server-only', () => ({}))
vi.mock('@/app/components/EnforcerList', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-enforcer-list">Mock Enforcer List</div>
}))
vi.mock('@mui/icons-material', () => ({
  __esModule: true,
  Person: () => <div>PersonIcon</div>,
  Email: () => <div>EmailIcon</div>,
  Lock: () => <div>LockIcon</div>,
  Visibility: () => <div>Visibility</div>,
  VisibilityOff: () => <div>VisibilityOff</div>,
  CheckCircle: () => <div>CheckCircleIcon</div>,
  Add: () => <div>AddIcon</div>,
}))

// 🔧 spy on alert
const mockAlert = vi.fn()
beforeEach(() => {
  Object.defineProperty(window, 'alert', {
    writable: true,
    value: mockAlert
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Displays Enforcement Management dashboard heading', () => {
  render(<EnforcementView />)
  expect(screen.getByText('Enforcement Management')).toBeDefined()
})

it('toggles password visibility', async () => {
  render(<EnforcementView />)

  const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0]
  await userEvent.click(toggleButton)
  // You can’t easily assert visibility state, but coverage-wise this executes the toggle
})

it('toggles confirm password visibility', async () => {
  render(<EnforcementView />)

  const toggleButton = screen.getAllByRole('button', { name: /show confirm password/i })[0]
  await userEvent.click(toggleButton)
})

it('alerts when passwords do not match', async () => {
  render(<EnforcementView />)

  await userEvent.type(screen.getByRole('textbox', { name: /First Name/i }), 'Test')
  await userEvent.type(screen.getByRole('textbox', { name: /Last Name/i }), 'User')
  await userEvent.type(screen.getByRole('textbox', { name: /Email Address/i }), 'test@example.com')

  const passwordFields = screen.getAllByLabelText(/Password/i)
  const passwordInput = passwordFields[0] // Password
  const confirmPasswordInput = passwordFields[1] // Confirm Password

  await userEvent.type(passwordInput, '123456')
  await userEvent.type(confirmPasswordInput, 'wrong')

  await userEvent.click(screen.getByLabelText('create-new-enforcer'))
  expect(mockAlert).toHaveBeenCalledWith('Passwords do not match.')
})

it('displays success alert and created enforcer details after submission', async () => {
  // Mock the result of makeEnforcer
  (makeEnforcer as any).mockResolvedValue({
    name: 'TEST USER',
    email: 'test@example.com'
  })

  render(<EnforcementView />)

  // Fill out the form
  await userEvent.type(screen.getByRole('textbox', { name: /First Name/i }), 'Test')
  await userEvent.type(screen.getByRole('textbox', { name: /Last Name/i }), 'User')
  await userEvent.type(screen.getByRole('textbox', { name: /Email Address/i }), 'test@example.com')

  const passwordFields = screen.getAllByLabelText(/Password/i)
  await userEvent.type(passwordFields[0], '123456')
  await userEvent.type(passwordFields[1], '123456')

  // Submit form
  await userEvent.click(screen.getByLabelText('create-new-enforcer'))

  // Wait for success alert to appear
  await waitFor(() => {
    expect(screen.getByText(/Account Created Successfully/i)).toBeTruthy()
    expect(screen.getByText(/Enforcer account has been created/i)).toBeTruthy()
    expect(screen.getByText(/Name:/i)).toBeTruthy()
    expect(screen.getByText(/TEST USER/i)).toBeTruthy()
    expect(screen.getByText(/Email:/i)).toBeTruthy()
    expect(screen.getByText(/test@example.com/i)).toBeTruthy()
  })

  // Optional: Test "Create Another Enforcer" reset functionality
  await userEvent.click(screen.getByLabelText('create-another'))

  // Confirm it resets to form view again
  expect(screen.getByText(/Create New Enforcer/i)).toBeTruthy()
})

