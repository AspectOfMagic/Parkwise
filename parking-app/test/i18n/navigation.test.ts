// navigation.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createNavigation } from 'next-intl/navigation';
import { routing } from '../../src/i18n/routing';
import { Link, redirect, usePathname, useRouter, getPathname } from '../../src/i18n/navigation'; // Update with your actual file path

// Mock next-intl/navigation and routing
vi.mock('next-intl/navigation', () => ({
  createNavigation: vi.fn().mockReturnValue({
    Link: vi.fn(),
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
    getPathname: vi.fn()
  })
}));

vi.mock('./routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en'
  }
}));

describe('navigation exports', () => {
  it('should export all navigation methods', () => {
    expect(Link).toBeDefined();
    expect(redirect).toBeDefined();
    expect(usePathname).toBeDefined();
    expect(useRouter).toBeDefined();
    expect(getPathname).toBeDefined();
  });

  it('should create navigation with the correct routing config', () => {
    expect(createNavigation).toHaveBeenCalledWith(routing);
  });

  it('should have mock functions that can be tested', () => {
    // Test Link component
    const mockLinkProps = { href: '/test', locale: 'en' };
    Link(mockLinkProps);
    expect(Link).toHaveBeenCalledWith(mockLinkProps);

    // Test redirect function
    redirect('/test');
    expect(redirect).toHaveBeenCalledWith('/test');

    // Test usePathname
    usePathname();
    expect(usePathname).toHaveBeenCalled();

    // Test useRouter
    useRouter();
    expect(useRouter).toHaveBeenCalled();

    // Test getPathname
    getPathname({ href: '/test', locale: 'en' });
    expect(getPathname).toHaveBeenCalledWith({ href: '/test', locale: 'en' });
  });
});