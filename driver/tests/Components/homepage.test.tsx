import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import HomePage from '@/app/[locale]/home/page';

// Mock Header and HomeMenu components
vi.mock('@/app/[locale]/home/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Mock Header</div>,
}));

vi.mock('@/app/[locale]/home/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="homemenu">Mock HomeMenu</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('HomePage', () => {
  it('renders Header and HomeMenu components', () => {
    render(<HomePage />);
    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('homemenu')).toBeDefined();
  });
});
