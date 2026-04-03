import { useTranslation } from 'react-i18next';
import type { I18nNamespace } from '../constants/i18n';

export function useI18n(ns: I18nNamespace = 'common') {
  return useTranslation(ns);
}
