export type Language = 'tr' | 'en' | 'nl' | 'de' | 'fr';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ─── Borders ──────────────────────────────────────────────────────────────────

export interface BorderDoc {
  id: string;
  name: string;
  fromCountry: string;
  toCountry: string;
  fromFlag: string;
  toFlag: string;
  /** Minutes; null = unknown */
  waitTimeMinutes: number | null;
  reportCount: number;
  updatedAt: Date;
  sortOrder: number;
}

export interface BorderReport {
  borderId: string;
  borderName: string;
  waitTimeMinutes: number;
  notes: string;
  userId: string | null;
  createdAt: Date;
}

export type WaitBucket = 'low' | 'medium' | 'high' | 'unknown';

export function waitBucket(mins: number | null): WaitBucket {
  if (mins === null) return 'unknown';
  if (mins < 30) return 'low';
  if (mins <= 90) return 'medium';
  return 'high';
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  completedBy?: string[];
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  publishedAt: Date;
  source: string;
}
