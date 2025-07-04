import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// Reusable view mocks
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

describe('ActionView when selectedAction is null', () => {
  it('renders TicketView', async () => {
    vi.mock('@/app/components/ActionContext', () => ({
      useSelectedAction: () => ({
        selectedAction: null,
      }),
    }))
    const { default: ActionView } = await import('@/app/components/ActionView')
    render(<ActionView />)
    expect(screen.getByText('Mock Ticket View')).toBeTruthy()
  })
})
