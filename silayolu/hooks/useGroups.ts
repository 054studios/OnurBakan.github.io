import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import type { ChatGroup } from '../types';
import { seedChatGroupsIfNeeded } from '../utils/seedChat';

interface UseGroupsResult {
  groups: ChatGroup[];
  loading: boolean;
}

export function useGroups(): UseGroupsResult {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed groups on first run (no-op if already seeded)
    seedChatGroupsIfNeeded().catch((err) =>
      console.warn('[useGroups] seed error:', err),
    );

    const unsubscribe = firestore()
      .collection('chatGroups')
      .orderBy('name', 'asc')
      .onSnapshot(
        (snapshot) => {
          const docs: ChatGroup[] = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              name: d.name ?? '',
              emoji: d.emoji ?? '💬',
              memberCount: d.memberCount ?? 0,
              lastMessage: d.lastMessage ?? null,
              lastMessageAt: d.lastMessageAt?.toDate?.() ?? null,
            };
          });
          setGroups(docs);
          setLoading(false);
        },
        (err) => {
          console.warn('[useGroups] snapshot error:', err);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  return { groups, loading };
}
