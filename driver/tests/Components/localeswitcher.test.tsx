import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LocaleSwitcher from '@/app/[locale]/components/LocaleSwitcher';

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

describe('LocaleSwitcher', () => {
  it('renders the globe icon button', () => {
    render(<LocaleSwitcher />);
    expect(screen.getByRole('button', { name: 'Select Language' })).toBeDefined();
  });

  it('opens menu and renders language options', () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'Select Language' }));
    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('中文')).toBeDefined();
  });

  it('clicking English calls router.replace with en', () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'Select Language' }));
    fireEvent.click(screen.getByText('English'));
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/mock-path' }, { locale: 'en' });
  });

  it('clicking Chinese calls router.replace with cn', () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'Select Language' }));
    fireEvent.click(screen.getByText('中文'));
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/mock-path' }, { locale: 'cn' });
  });
});
