export const i18nNamespaces = ['common', 'tabs', 'auth', 'home', 'borders', 'challenges', 'chat', 'news'] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];

export const supportedLanguages = ['tr', 'nl', 'de', 'fr'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageLabels: Record<SupportedLanguage, string> = {
  tr: 'Türkçe',
  nl: 'Nederlands',
  de: 'Deutsch',
  fr: 'Français',
};
