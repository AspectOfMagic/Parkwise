import { describe, it, expect, vi} from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '@/app/[locale]/page';

// Mock the actual HomePage component so we only test the wrapper
vi.mock('@/app/[locale]/home/page', () => ({
  __esModule: true,
  default: () => <div data-testid="homepage">Mocked HomePage</div>,
}));

describe('App Page', () => {
  it('renders the HomePage component', () => {
    render(<Page />);
    expect(screen.getByTestId('homepage')).toBeTruthy();
  });
});
