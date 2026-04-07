export type NewsCategory = 'visa' | 'car' | 'toll' | 'tips';

export interface NewsItem {
  id: string;
  category: NewsCategory;
  title: string;
  excerpt: string;
  source: string;
  languages: string[];   // e.g. ['TR', 'NL', 'DE']
  isCommunity: boolean;
  publishedAt: any;      // Firestore Timestamp
  createdAt: any;
}

export interface AlertItem {
  id: string;
  message: string;
  /** ISO date string */
  expiresAt: string;
  severity: 'info' | 'warning' | 'critical';
}
