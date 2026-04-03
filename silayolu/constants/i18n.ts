export const i18nNamespaces = ['common', 'tabs', 'home', 'borders', 'challenges', 'chat', 'news'] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];
