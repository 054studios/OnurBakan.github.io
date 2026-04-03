export type Language = 'tr' | 'en';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface BorderCrossing {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  waitTime?: number;
  status: 'open' | 'closed' | 'limited';
  updatedAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  completedBy?: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  publishedAt: Date;
  source: string;
}
