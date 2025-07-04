import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import Page from '../../src/app/page'

vi.mock('server-only', () => ({}))

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

it('displays the parking enforcement home text', () => {
  render(<Page />)

  expect(screen.getByText('Parking Permit Verification')).toBeDefined()
})