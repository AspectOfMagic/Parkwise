import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LocaleSwitcherLogin from '@/app/[locale]/components/LocaleSwitcherLogin';

const mockReplace = vi.fn();

// Mock navigation module with shared mockReplace
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/mock-path',
}));

// Mock useTranslations
vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        english: 'English',
        chinese: '中文',
      };
      return translations[key] || key;
    };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('LocaleSwitcherLogin', () => {
  it('renders both English and Chinese buttons', () => {
    render(<LocaleSwitcherLogin />);
    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('中文')).toBeDefined();
  });

  it('when English button is clicked', () => {
    render(<LocaleSwitcherLogin />);
    fireEvent.click(screen.getByText('English'));
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/mock-path' }, { locale: 'en' });
  });

  it('when Chinese button is clicked', () => {
    render(<LocaleSwitcherLogin />);
    fireEvent.click(screen.getByText('中文'));
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/mock-path' }, { locale: 'cn' });
  });
});
