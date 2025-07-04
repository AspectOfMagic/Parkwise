import '@testing-library/jest-dom';
import { it, expect, beforeEach, afterEach, vi} from 'vitest';
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import userEvent from '@testing-library/user-event'


import Home from '../../src/app/[locale]/page';
import PrivacyPolicy from '@/app/components/legal/PrivacyPolicy';
import DoNotSellInfo from '@/app/components/legal/DoNotSellInfo';
import TermsOfUse from '@/app/components/legal/TermsOfUse';

const user = userEvent

// Mock next/image
const mockReplace = vi.fn();

// Mock Next.js navigation first (this is what's missing)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/mock-path',
}));

// Mock navigation module with shared mockReplace
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/mock-path',
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const messages = {
  body: {
    slogan1: 'Find parking',
    slogan2: 'Save money',
    slogan3: 'Reduce stress',
    button: 'Get Started'
  },
  footer: {
    title: 'ParkWise',
    line1: 'Do Not Sell My Personal Information',
    line2: 'Privacy Policy',
    line3: 'Terms of Use'
  },
  enhanced: {
    headline: 'Smart Parking Solutions',
    line1: 'Find the best parking spots near you',
    line2: 'Save up to 50% on parking fees'
  },
  common: {
    english: 'english',
    chinese: 'chinese',
  }
};

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

it('renders the main components correctly', async () => {
  renderWithIntl(<Home />);

  await act(async () => {
    vi.advanceTimersByTime(2000);
  });

 expect(screen.getByText(/Find parking\s+Save money\s+Reduce stress/)).toBeInTheDocument();
 expect(screen.getByText('Smart Parking Solutions')).toBeInTheDocument();
expect(screen.getByText('Find the best parking spots near you')).toBeInTheDocument();
expect(screen.getByText('Save up to 50% on parking fees')).toBeInTheDocument();

// Check button
expect(screen.getByText('Get Started')).toBeInTheDocument();

// Check footer
expect(screen.getByText('ParkWise')).toBeInTheDocument();
expect(screen.getByText('Do Not Sell My Personal Information')).toBeInTheDocument();
expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
expect(screen.getByText('Terms of Use')).toBeInTheDocument();
});


it('opens and closes legal dialogs', async () => {
  renderWithIntl(<Home />);
  
  await act(async () => {
    vi.advanceTimersByTime(2000);
  });

  // Test Privacy Policy dialog
  const privacyPolicyLinks = screen.getAllByText('Privacy Policy');
  const privacyPolicyLink = privacyPolicyLinks.find(element => element.tagName.toLowerCase() === 'a');
  fireEvent.click(privacyPolicyLink);

  expect(screen.getByText(/ParkWise is committed to protecting your privacy/i)).toBeInTheDocument();

  user.keyboard('{Escape}');

  await act(async () => {
    vi.advanceTimersByTime(2000);
  });

  const nosells = screen.getAllByText('Do Not Sell My Personal Information');
  const nosell = nosells.find(element => element.tagName.toLowerCase() === 'a');
  fireEvent.click(nosell);

  expect(screen.getByText(
      'At ParkWise, we respect your privacy and are committed to protecting your personal information. As part of our dedication to transparency and user control, we do not sell your personal information to third parties.'
    )).toBeInTheDocument();

  user.keyboard('{Escape}');

  await act(async () => {
    vi.advanceTimersByTime(2000);
  });

  const Terms = screen.getAllByText('Terms of Use');
  const Term = Terms.find(element => element.tagName.toLowerCase() === 'a');
  fireEvent.click(Term);

  expect(
    screen.getByText(/Welcome to ParkWise\. By accessing or using our app/i)
  ).toBeInTheDocument();

  user.keyboard('{Escape}');

  await act(async () => {
    vi.advanceTimersByTime(2000);
  });
});

it('navigates to driver page when button is clicked', async () => {
  const originalLocation = window.location;
  // @ts-ignore
  delete window.location;
  window.location = { ...originalLocation, href: '' };
  
  renderWithIntl(<Home />);

  await act(async () => {
  vi.advanceTimersByTime(2000);
  });

  fireEvent.click(screen.getByText('Get Started'));
  expect(window.location.href).toBe('/driver');
  
  window.location = originalLocation;
});

it('initially hides content then fades in', async () => {
  renderWithIntl(<Home />);

  
  // Initially should not show content
  expect(screen.queryByText(/Find parking\s+Save money\s+Reduce stress/)).not.toBeInTheDocument();

  
  // After timeout, content should appear
    await act(async () => {
    vi.advanceTimersByTime(2000);
  });

   expect(screen.getByText(/Find parking\s+Save money\s+Reduce stress/)).toBeInTheDocument();

  
});