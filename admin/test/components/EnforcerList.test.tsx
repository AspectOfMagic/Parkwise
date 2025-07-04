import { vi, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import React from 'react';

import { fetchEnforcers, removeEnforcer } from '@/app/dashboard/actions';
import EnforcerList from '@/app/components/EnforcerList';
import { Enforcer } from '@/verify';

vi.mock('../../src/app/dashboard/actions', () => ({
  fetchEnforcers: vi.fn(),
	removeEnforcer: vi.fn()
}))

afterEach(() => {
  cleanup();
	vi.clearAllMocks();
});


it('Enforcers are fetched and displayed correctly', async () => {
	const mockEnforcers = [
		{
			id: '1',
			name: 'JOHN DOE',
			email: 'john.doe@example.com'
		},
		{
			id: '2',
			name: 'JANE SMITH',
			email: 'jane.smith@example.com'
		}
	] as Enforcer[]
	
	// Mock fetchEnforcers to return the mock data
	vi.mocked(fetchEnforcers).mockResolvedValue(mockEnforcers)
	
	render(<EnforcerList />)
	
	// Wait for the component to fetch and render the data
	await waitFor(() => {
		expect(screen.getByText('john.doe@example.com')).toBeDefined()
	})

})

it('Catches error on failure to fetch enforcers', async () => {
	// mock error on fetch
	const mockError = new Error('Failed to fetch enforcers')
	vi.mocked(fetchEnforcers).mockRejectedValue(mockError)
	
	render(<EnforcerList />)
	// Wait for error handling to complete
	await waitFor(() => {
		// Check for error message or empty state
		expect(screen.queryByText('john.doe@example.com')).toBeNull()
	})
})

it('Removes enforcer on click of delete button', async () => {
	const mockEnforcers = [
		{
			id: '1',
			name: 'JOHN DOE',
			email: 'john.doe@example.com'
		},
		{
			id: '2',
			name: 'JANE SMITH',
			email: 'jane.smith@example.com'
		}
	]
	
	// Mock successful fetch
	vi.mocked(fetchEnforcers).mockResolvedValue(mockEnforcers)
	// Mock successful removal
	vi.mocked(removeEnforcer).mockResolvedValue(mockEnforcers[0])
	
	render(<EnforcerList />)
	const user = userEvent.setup()
		
	await waitFor(() => {
		screen.getByText('john.doe@example.com')
	})
	// Find and click the delete button for the first enforcer
	const deleteButton = screen.getByLabelText('remove-enforcer-0')
	await user.click(deleteButton)

	// Verify removeEnforcer was called with correct ID
	expect(removeEnforcer).toHaveBeenCalledWith("1")
})

it('Catches error on failure to remove (delete) enforcer', async () => {
	const mockEnforcers = [
		{
			id: '1',
			name: 'JOHN DOE',
			email: 'john.doe@example.com'
		},
		{
			id: '2',
			name: 'JANE SMITH',
			email: 'jane.smith@example.com'
		}
	]
	
	vi.mocked(fetchEnforcers).mockResolvedValue(mockEnforcers)
	// Mock failed removal
	const mockError = new Error('Failed to remove enforcer')
	vi.mocked(removeEnforcer).mockRejectedValue(mockError)
	
	// Mock console.error to avoid error logs in test output
	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
	
	render(<EnforcerList />)
	const user = userEvent.setup()

	// Wait for enforcers to load
	await waitFor(() => {
		screen.getByText('john.doe@example.com')
	})
	
	// Find and click the delete button for the first enforcer
	const deleteButton = screen.getByLabelText('remove-enforcer-0')
	await user.click(deleteButton)
	
	// Wait for the error to be handled
	await waitFor(() => {
		expect(removeEnforcer).toHaveBeenCalledWith('1')
	})
	
	expect(consoleSpy).toHaveBeenCalled()
})
