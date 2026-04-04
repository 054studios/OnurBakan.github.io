import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalXP: number;
  earnedBadges: string[];
  rank: number;
}

interface UseLeaderboardResult {
  entries: LeaderboardEntry[];
  loading: boolean;
}

export function useLeaderboard(): UseLeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('userProgress')
      .orderBy('totalXP', 'desc')
      .limit(50)
      .onSnapshot(
        (snap) => {
          const list: LeaderboardEntry[] = snap.docs.map((doc, i) => {
            const d = doc.data();
            return {
              userId: doc.id,
              displayName: d.displayName ?? 'Anonim',
              totalXP: d.totalXP ?? 0,
              earnedBadges: d.earnedBadges ?? [],
              rank: i + 1,
            };
          });
          setEntries(list);
          setLoading(false);
        },
        (err) => {
          console.warn('[useLeaderboard]', err);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  return { entries, loading };
}
