import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Header from '@/app/[locale]/home/Header';

// Mock next/image to render a basic img tag
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, width, height } = props;
    // simple fallback image renderer
    return <img src={src} alt={alt} width={width} height={height} />;
  },
}));

// Mock translation function from next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        name: 'ParkWise'
      };
      return translations[key] || key;
    };
  },
}));

// Mock LocaleSwitcher
vi.mock('@/app/[locale]/components/LocaleSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="locale-switcher">LocaleSwitcher</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('Header', () => {
  it('renders logo, title, and locale switcher', () => {
    render(<Header />);

    expect(screen.getByAltText('ParkWise Logo')).toBeDefined();
    expect(screen.getByText('ParkWise')).toBeDefined();
    expect(screen.getByTestId('locale-switcher')).toBeDefined();
  });
});
