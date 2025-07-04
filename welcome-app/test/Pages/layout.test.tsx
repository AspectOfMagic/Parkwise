import { describe, it, expect, vi } from 'vitest';
import ReactDOMServer from 'react-dom/server';
import RootLayout from '@/app/[locale]/layout';

// Mocks
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  hasLocale: (locales: string[], locale: string) => locales.includes(locale),
}));
vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es', 'zh'],
  },
}));

describe('RootLayout', () => {
  it('renders children without HTML nesting errors', async () => {
    const element = await RootLayout({
      children: <div id="layout-children">Hello</div>,
      params: Promise.resolve({ locale: 'en' }),
    });

    const html = ReactDOMServer.renderToString(element);
    expect(html).toContain('layout-children');
    expect(html).toContain('Hello');
  });

  it('calls notFound when locale is invalid', async () => {
    const { notFound } = await import('next/navigation');

    await RootLayout({
      children: <div>Should not render</div>,
      params: Promise.resolve({ locale: 'xx' }),
    });

    expect(notFound).toHaveBeenCalled();
  });
});
