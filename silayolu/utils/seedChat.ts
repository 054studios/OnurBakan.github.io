import firestore from '@react-native-firebase/firestore';

export const CHAT_GROUPS_SEED = [
  { id: 'bg-route', name: 'Bulgaristan Grubu', emoji: '🇧🇬' },
  { id: 'nl-group', name: 'NL Vertrekkers',    emoji: '🇳🇱' },
  { id: 'kapikule', name: 'Kapıkule Sınırı',  emoji: '🛂' },
  { id: 'general',  name: 'Genel Seyahat',    emoji: '🌍' },
] as const;

let seeded = false; // in-memory guard — prevents repeated Firestore reads per session

export async function seedChatGroupsIfNeeded(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const snapshot = await firestore().collection('chatGroups').limit(1).get();
  if (!snapshot.empty) return; // already seeded

  const batch = firestore().batch();
  for (const group of CHAT_GROUPS_SEED) {
    const ref = firestore().collection('chatGroups').doc(group.id);
    batch.set(ref, {
      name: group.name,
      emoji: group.emoji,
      memberCount: 0,
      lastMessage: null,
      lastMessageAt: null,
    });
  }
  await batch.commit();
}
