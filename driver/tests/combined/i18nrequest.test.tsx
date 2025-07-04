import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/i18n/routing', () => ({
  routing: {
    locales: ['en', 'cn'],
    defaultLocale: 'en'
  }
}));

const mockHasLocale = vi.fn();
vi.mock('next-intl', () => ({
  hasLocale: mockHasLocale
}));

const mockGetRequestConfig = vi.fn((fn) => fn);
vi.mock('next-intl/server', () => ({
  getRequestConfig: mockGetRequestConfig
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getRequestConfig wrapper', () => {
  it('returns correct config when locale is supported (cn)', async () => {
    mockHasLocale.mockReturnValue(true);

    const config = (await import('../../src/i18n/request')).default;
    const result = await config({ requestLocale: Promise.resolve('cn') });

    expect(mockGetRequestConfig).toHaveBeenCalled();
    expect(result.locale).toBe('cn');
    expect(result.messages).toHaveProperty('home.text1', '你好');
    expect(result.messages).toHaveProperty('login.title', '请登陆您的账号');
  });

  it('falls back to default locale when locale is unsupported', async () => {
    mockHasLocale.mockReturnValue(false);

    const config = (await import('../../src/i18n/request')).default;
    const result = await config({ requestLocale: Promise.resolve('fr') });

    expect(result.locale).toBe('en');
    expect(result.messages).toHaveProperty('home.text1', 'Hi');
    expect(result.messages).toHaveProperty('login.title', 'Log In To Your Account');
  });
});
