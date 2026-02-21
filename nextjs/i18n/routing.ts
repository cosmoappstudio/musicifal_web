import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['tr', 'en', 'de', 'ru'],
  defaultLocale: 'tr',
});
