import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Footer from '@/app/[locale]/footer';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, width, height } = props;
    return <img src={src} alt={alt} width={width} height={height} />;
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string) => {
      if (key === 'name') return 'ParkWise';
      if (key === 'text1') return 'Privacy Policy';
      if (key === 'text2') return 'Terms of Service';
      if (key === 'text3') return 'Contact Info';
      return key;
    };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('Footer', () => {
  it('renders the logo and app name', () => {
    render(<Footer />);
    expect(screen.getByAltText('Footer Logo')).toBeTruthy();
    expect(screen.getByText('ParkWise')).toBeTruthy();
  });

  it('renders the footer links in correct order', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');

    expect(links.length).toBe(3);
    expect(links[0].textContent).toBe('Privacy Policy');
    expect(links[1].textContent).toBe('Terms of Service');
    expect(links[2].textContent).toBe('Contact Info');
  });
});
