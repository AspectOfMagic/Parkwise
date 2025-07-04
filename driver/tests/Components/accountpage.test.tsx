import { it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import AccountPage from '../../src/app/[locale]/account/page';

const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

beforeEach(() => {
  sessionStorage.clear();
  mockBack.mockReset();
});

afterEach(() => {
  cleanup();
});

const messages = {
  placeholder: {
    name: 'Name',
    email: 'Email',
    text1: 'Your Account Information',
    text2: 'Edit your contact details below.',
  },
  contact: {
    back: 'Back',
    email: 'Contact Email',
  },
};

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

it('displays name and email from sessionStorage correctly', () => {
  sessionStorage.setItem('name', 'Molly Member');
  sessionStorage.setItem('email', 'mollymember@books.com');

  renderWithIntl(<AccountPage />);

  expect(screen.getByText('Molly Member')).toBeDefined();
  expect(screen.getByText('Molly')).toBeDefined();
  expect(screen.getByText('Member')).toBeDefined();
  expect(screen.getByText('mollymember@books.com')).toBeDefined();
});

it('back icon is clicked', () => {
  renderWithIntl(<AccountPage />);
  fireEvent.click(screen.getByTestId('back-icon'));
  expect(mockBack).toHaveBeenCalled();
});
