import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// ✅ Mock child components once (they’re reused)
vi.mock('@/app/components/EnforcementView', () => ({
  __esModule: true,
  default: () => <div>Mock Enforcement View</div>,
}))
vi.mock('@/app/components/TicketView', () => ({
  __esModule: true,
  default: () => <div>Mock Ticket View</div>,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetModules()
})
describe('ActionView when selectedAction is "Enforcement"', () => {
  it('renders EnforcementView', async () => {
    vi.mock('@/app/components/ActionContext', () => ({
      useSelectedAction: () => ({
        selectedAction: 'Enforcement',
      }),
    }))
    const { default: ActionView } = await import('@/app/components/ActionView')
    render(<ActionView />)
    expect(screen.getByText('Mock Enforcement View')).toBeTruthy()
  })
})
