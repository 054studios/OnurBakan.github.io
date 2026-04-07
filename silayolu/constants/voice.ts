export interface VoiceChannel {
  id: string;
  name: string;
  emoji: string;
  route: string;
}

export const VOICE_CHANNELS: VoiceChannel[] = [
  { id: 'bg-route',        name: 'Bulgaristan Rotası', emoji: '🇧🇬', route: 'BG → TR' },
  { id: 'kapikule-border', name: 'Kapıkule Sınırı',    emoji: '🛂', route: 'BG ↔ TR' },
  { id: 'nl-group',        name: 'NL Grubu',           emoji: '🇳🇱', route: 'NL → TR' },
  { id: 'general',         name: 'Genel',              emoji: '🌍', route: 'Tüm Rota' },
];

export const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID ?? '';
