export interface RouteCountry {
  code: string;
  flag: string;
  nameKey: string; // i18n key: 'borders:countries.XX'
}

export const ROUTE_COUNTRIES: RouteCountry[] = [
  { code: 'NL', flag: '🇳🇱', nameKey: 'countries.NL' },
  { code: 'DE', flag: '🇩🇪', nameKey: 'countries.DE' },
  { code: 'AT', flag: '🇦🇹', nameKey: 'countries.AT' },
  { code: 'HU', flag: '🇭🇺', nameKey: 'countries.HU' },
  { code: 'RO', flag: '🇷🇴', nameKey: 'countries.RO' },
  { code: 'BG', flag: '🇧🇬', nameKey: 'countries.BG' },
  { code: 'TR', flag: '🇹🇷', nameKey: 'countries.TR' },
];

// Border crossings that exist on this route (seeded in Firestore)
export const ROUTE_BORDERS = [
  { id: 'kapikule',   name: 'Kapıkule',     fromCountry: 'BG', toCountry: 'TR', fromFlag: '🇧🇬', toFlag: '🇹🇷', sortOrder: 1 },
  { id: 'derekoey',  name: 'Dereköy',      fromCountry: 'BG', toCountry: 'TR', fromFlag: '🇧🇬', toFlag: '🇹🇷', sortOrder: 2 },
  { id: 'ruse',      name: 'Ruse–Giurgiu', fromCountry: 'RO', toCountry: 'BG', fromFlag: '🇷🇴', toFlag: '🇧🇬', sortOrder: 3 },
  { id: 'calafat',   name: 'Calafat–Vidin',fromCountry: 'RO', toCountry: 'BG', fromFlag: '🇷🇴', toFlag: '🇧🇬', sortOrder: 4 },
  { id: 'bors',      name: 'Artand–Borş',  fromCountry: 'HU', toCountry: 'RO', fromFlag: '🇭🇺', toFlag: '🇷🇴', sortOrder: 5 },
  { id: 'hegyeshalom',name:'Hegyeshalom',  fromCountry: 'AT', toCountry: 'HU', fromFlag: '🇦🇹', toFlag: '🇭🇺', sortOrder: 6 },
] as const;
