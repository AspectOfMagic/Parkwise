import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';

import StateDropdown from '../../src/app/home/StateDropdown';

it('allows changing the selected state', async () => {
  const handleChange = vi.fn();
  const user = userEvent.setup();

  render(<StateDropdown value="CA" onChange={handleChange} />);

  const dropdown = screen.getByLabelText('State');
  await user.click(dropdown);

  const nyOption = screen.getByText('NY');
  await user.click(nyOption);

  expect(handleChange).toHaveBeenCalledWith('NY');
});