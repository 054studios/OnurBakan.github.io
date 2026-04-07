export const Colors = {
  bg: '#F5F0E8',
  surface: '#FDFAF4',
  border: '#D9CEBB',
  ink: '#1A1612',
  muted: '#8A7E6E',
  accent: '#C4390A',
  accent2: '#1B4F8A',
  accent3: '#2E7D4F',
  warn: '#D4820A',
  gold: '#C9940A',
} as const;

export type ColorKey = keyof typeof Colors;
