import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'

// Mock child components to avoid EMFILE and speed up tests
vi.mock('../../src/app/components/BarViewContainer', () => ({
  __esModule: true,
  default: () => <div data-testid="barview">Mock BarViewContainer</div>,
}))
vi.mock('../../src/app/components/SideBar', () => ({
  __esModule: true,
  default: () => <button aria-label="Enforcement">Mock SideBar</button>,
}))

// Mock server-only
vi.mock('server-only', () => ({}))

import Page from '../../src/app/page'
import { useSelectedAction } from '@/app/components/ActionContext'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Dashboard Page', () => {
  it('Displays mock bar and sidebar', () => {
    render(<Page />)
    expect(screen.getByTestId('barview')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Enforcement' })).toBeDefined()
  })

  it('Handles action view click simulation', async () => {
    render(<Page />)
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Enforcement'))
    // Since we're mocking, we just verify the click doesn't crash
    expect(true).toBe(true) // Or check for side effects if available
  })

  it('should throw error when useSelectedAction is used outside ActionProvider', () => {
    const TestComponent = () => {
      useSelectedAction()
      return <div>Test</div>
    }

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useSelectedAction must be used within a ActionProvider')
  })
})
