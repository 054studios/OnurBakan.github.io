import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../constants/locales/en/common.json';
import enTabs from '../constants/locales/en/tabs.json';
import trCommon from '../constants/locales/tr/common.json';
import trTabs from '../constants/locales/tr/tabs.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'tr',
  fallbackLng: 'en',
  resources: {
    en: {
      common: enCommon,
      tabs: enTabs,
    },
    tr: {
      common: trCommon,
      tabs: trTabs,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
