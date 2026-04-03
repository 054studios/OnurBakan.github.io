import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../constants/locales/en/common.json';
import enTabs from '../constants/locales/en/tabs.json';
import enAuth from '../constants/locales/en/auth.json';
import enBorders from '../constants/locales/en/borders.json';
import enChat from '../constants/locales/en/chat.json';

import trCommon from '../constants/locales/tr/common.json';
import trTabs from '../constants/locales/tr/tabs.json';
import trAuth from '../constants/locales/tr/auth.json';
import trBorders from '../constants/locales/tr/borders.json';
import trChat from '../constants/locales/tr/chat.json';

import nlCommon from '../constants/locales/nl/common.json';
import nlTabs from '../constants/locales/nl/tabs.json';
import nlAuth from '../constants/locales/nl/auth.json';
import nlBorders from '../constants/locales/nl/borders.json';
import nlChat from '../constants/locales/nl/chat.json';

import deCommon from '../constants/locales/de/common.json';
import deTabs from '../constants/locales/de/tabs.json';
import deAuth from '../constants/locales/de/auth.json';
import deBorders from '../constants/locales/de/borders.json';
import deChat from '../constants/locales/de/chat.json';

import frCommon from '../constants/locales/fr/common.json';
import frTabs from '../constants/locales/fr/tabs.json';
import frAuth from '../constants/locales/fr/auth.json';
import frBorders from '../constants/locales/fr/borders.json';
import frChat from '../constants/locales/fr/chat.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'tr',
  fallbackLng: 'en',
  resources: {
    en: { common: enCommon, tabs: enTabs, auth: enAuth, borders: enBorders, chat: enChat },
    tr: { common: trCommon, tabs: trTabs, auth: trAuth, borders: trBorders, chat: trChat },
    nl: { common: nlCommon, tabs: nlTabs, auth: nlAuth, borders: nlBorders, chat: nlChat },
    de: { common: deCommon, tabs: deTabs, auth: deAuth, borders: deBorders, chat: deChat },
    fr: { common: frCommon, tabs: frTabs, auth: frAuth, borders: frBorders, chat: frChat },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
