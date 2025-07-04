import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActionList from '@/app/components/ActionList'
import React from 'react'

// Mock ActionContext
const setSelectedAction = vi.fn()
vi.mock('@/app/components/ActionContext', () => ({
  useSelectedAction: () => ({
    selectedAction: null,
    setSelectedAction,
  }),
}))

describe('ActionList', () => {
  it('calls setSelectedAction when an action is clicked', async () => {
    render(<ActionList />)
    const user = userEvent.setup()

    // Click "Resolve Tickets"
    await user.click(screen.getByLabelText('Resolve Tickets'))
    expect(setSelectedAction).toHaveBeenCalledWith('Resolve Tickets')

    // Click "Enforcement"
    await user.click(screen.getByLabelText('Enforcement'))
    expect(setSelectedAction).toHaveBeenCalledWith('Enforcement')
  })
})
