import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'


vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt || 'mocked image'} />
  },
}))

vi.mock('@/app/components/ActionList', () => ({
  __esModule: true,
  default: () => <div data-testid="action-list">Mock ActionList</div>,
}))

// Component under test
import SideBar from '@/app/components/SideBar'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('SideBar', () => {
  it('renders the drawer with logo and action list', () => {
    render(<SideBar />)

    const logoImg = screen.getByAltText('ParkWise Logo')
    expect(logoImg).toBeTruthy()

    expect(screen.getByTestId('action-list')).toBeTruthy()

  })
})
