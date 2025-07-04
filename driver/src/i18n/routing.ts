import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'cn'],
  defaultLocale: 'en',
  localePrefix: "as-needed",
});