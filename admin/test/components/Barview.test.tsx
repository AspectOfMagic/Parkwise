import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

vi.mock('@/app/components/TopBar', () => ({
  __esModule: true,
  default: () => <div data-testid="top-bar">Mock TopBar</div>,
}))

vi.mock('@/app/components/ActionView', () => ({
  __esModule: true,
  default: () => <div data-testid="action-view">Mock ActionView</div>,
}))

import BarViewContainer from '@/app/components/BarViewContainer'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('BarViewContainer', () => {
  it('renders TopBar and ActionView inside layout container', () => {
    render(<BarViewContainer />)
    expect(screen.getByTestId('top-bar')).toBeTruthy()
    expect(screen.getByTestId('action-view')).toBeTruthy()

  })
})
