// ─── Challenge types ──────────────────────────────────────────────────────────

export type ChallengeType = 'route' | 'community' | 'speed' | 'distance';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ChallengeTask {
  id: string;
  description: string;
  xp: number;
  /** If true, progress is incremented automatically by the app */
  autoDetect?: boolean;
}

export interface ChallengeDef {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  emoji: string;
  season: string;
  xpReward: number;
  tasks: ChallengeTask[];
  /** Optional unlock condition shown in UI */
  unlockCondition?: string;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: BadgeRarity;
  /** challengeId that awards this badge, or 'all' for season */
  awardedBy: string;
}

export interface SeasonDef {
  name: string;
  description: string;
  requiredChallengeIds: string[];
  xpBonus: number;
  badgeId: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'three-countries-one-day',
    name: '3 Ülke, 1 Gün',
    description: 'Bir günde 3 farklı ülkeyi geç ve rotanı hızlandır.',
    type: 'route',
    emoji: '🗺️',
    season: 'Sezon 1',
    xpReward: 100,
    tasks: [
      { id: 'cross-1', description: 'Birinci ülke sınırını geç', xp: 20 },
      { id: 'cross-2', description: 'İkinci ülke sınırını geç', xp: 30 },
      { id: 'cross-3', description: 'Üçüncü ülke sınırını geç', xp: 50 },
    ],
  },
  {
    id: 'thousand-km-master',
    name: '1000 km Ustası',
    description: 'Tek günde 1000 km sürerek Avrupa rekoru kır.',
    type: 'distance',
    emoji: '⚡',
    season: 'Sezon 1',
    xpReward: 150,
    tasks: [
      { id: 'km-500',  description: '500 km tamamla',  xp: 50,  autoDetect: true },
      { id: 'km-1000', description: '1000 km tamamla', xp: 100, autoDetect: true },
    ],
  },
  {
    id: 'border-observer',
    name: 'Sınır Gözlemcisi',
    description: '5 sınır kapısı raporu göndererek topluluğa katkı sağla.',
    type: 'community',
    emoji: '🔍',
    season: 'Sezon 1',
    xpReward: 100,
    tasks: [
      { id: 'report-1', description: '1. raporu gönder', xp: 10, autoDetect: true },
      { id: 'report-2', description: '2. raporu gönder', xp: 10, autoDetect: true },
      { id: 'report-3', description: '3. raporu gönder', xp: 20, autoDetect: true },
      { id: 'report-4', description: '4. raporu gönder', xp: 20, autoDetect: true },
      { id: 'report-5', description: '5. raporu gönder', xp: 40, autoDetect: true },
    ],
  },
  {
    id: 'road-brother',
    name: 'Yol Kardeşi',
    description: 'Bir yolcuya yardım ederek Silayolu ruhunu yaşat.',
    type: 'community',
    emoji: '🤝',
    season: 'Sezon 1',
    xpReward: 100,
    tasks: [
      { id: 'share-info', description: 'Sohbet grubunda sınır bilgisi paylaş', xp: 40 },
      { id: 'help-done',  description: 'Bir yolcuya aktif yardım et',         xp: 60 },
    ],
  },
  {
    id: 'kapikule-speedster',
    name: 'Kapıkule Hızlısı',
    description: 'Kapıkule sınır kapısını 2 saatin altında geç.',
    type: 'speed',
    emoji: '🛂',
    season: 'Sezon 1',
    xpReward: 50,
    unlockCondition: 'Kapıkule yakınında aktif ol',
    tasks: [
      { id: 'arrive-kapikule', description: 'Kapıkule\'ye ulaş',         xp: 10 },
      { id: 'cross-under-2h',  description: '2 saatten kısa sürede geç', xp: 40 },
    ],
  },
];

export const BADGES: BadgeDef[] = [
  {
    id: 'first-steps',
    name: 'İlk Adımlar',
    description: 'Herhangi bir görevi tamamla',
    emoji: '🌱',
    rarity: 'common',
    awardedBy: 'any-task',
  },
  {
    id: 'badge-three-countries',
    name: '3 Ülke Kahramanı',
    description: '"3 Ülke, 1 Gün" görevini tamamla',
    emoji: '🗺️',
    rarity: 'rare',
    awardedBy: 'three-countries-one-day',
  },
  {
    id: 'badge-speed-master',
    name: 'Hız Ustası',
    description: '"1000 km Ustası" görevini tamamla',
    emoji: '⚡',
    rarity: 'epic',
    awardedBy: 'thousand-km-master',
  },
  {
    id: 'badge-border-watcher',
    name: 'Sınır Gözlemcisi',
    description: '"Sınır Gözlemcisi" görevini tamamla',
    emoji: '🔍',
    rarity: 'rare',
    awardedBy: 'border-observer',
  },
  {
    id: 'badge-road-brother',
    name: 'Yol Kardeşi',
    description: '"Yol Kardeşi" görevini tamamla',
    emoji: '🤝',
    rarity: 'rare',
    awardedBy: 'road-brother',
  },
  {
    id: 'badge-kapikule',
    name: 'Kapıkule Hızlısı',
    description: '"Kapıkule Hızlısı" görevini tamamla',
    emoji: '🛂',
    rarity: 'epic',
    awardedBy: 'kapikule-speedster',
  },
  {
    id: 'badge-champion',
    name: 'Silayolu Şampiyonu',
    description: 'Tüm 5 görevi tamamla — Sezon 1 efsanesi',
    emoji: '🏆',
    rarity: 'legendary',
    awardedBy: 'season',
  },
];

export const SEASON: SeasonDef = {
  name: 'Silayolu Şampiyonu',
  description: 'Sezon 1\'deki tüm 5 görevi tamamla ve altın rozet kazan!',
  requiredChallengeIds: CHALLENGES.map((c) => c.id),
  xpBonus: 500,
  badgeId: 'badge-champion',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1;
}

export function getLevelProgress(totalXP: number): { current: number; max: number } {
  return { current: totalXP % 100, max: 100 };
}

export const RARITY_COLORS: Record<BadgeRarity, string> = {
  common:    '#2E7D4F', // accent3
  rare:      '#1B4F8A', // accent2
  epic:      '#D4820A', // warn
  legendary: '#C9940A', // gold
};
