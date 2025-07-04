import {it, expect, vi } from 'vitest';

// Mock routing config
vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    pathnames: {
      '/about': {
        en: '/about',
        es: '/acerca',
      },
    },
  }
}));

const mockCreateNavigation = vi.fn(() => ({
  Link: 'MockLink',
  redirect: vi.fn(),
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  getPathname: vi.fn()
}));

// Mock next-intl/navigation with our spy
vi.mock('next-intl/navigation', () => ({
  createNavigation: mockCreateNavigation
}));

it('exports navigation helpers from createNavigation with routing', async () => {
  const { routing } = await import('@/i18n/routing');

  const {
    Link,
    redirect,
    usePathname,
    useRouter,
    getPathname
  } = await import('@/i18n/navigation');

  expect(typeof Link).toBe('string');
  expect(mockCreateNavigation).toHaveBeenCalledWith(routing);
});

