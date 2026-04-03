import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import type { BorderDoc } from '../types';

interface UseBordersResult {
  borders: BorderDoc[];
  loading: boolean;
  error: string | null;
}

/**
 * Real-time subscription to the "borders" Firestore collection.
 * Documents are ordered by sortOrder ascending.
 */
export function useBorders(): UseBordersResult {
  const [borders, setBorders] = useState<BorderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('borders')
      .orderBy('sortOrder', 'asc')
      .onSnapshot(
        (snapshot) => {
          const docs: BorderDoc[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name ?? '',
              fromCountry: data.fromCountry ?? '',
              toCountry: data.toCountry ?? '',
              fromFlag: data.fromFlag ?? '',
              toFlag: data.toFlag ?? '',
              waitTimeMinutes: data.waitTimeMinutes ?? null,
              reportCount: data.reportCount ?? 0,
              updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
              sortOrder: data.sortOrder ?? 0,
            };
          });
          setBorders(docs);
          setLoading(false);
        },
        (err) => {
          console.warn('[useBorders] onSnapshot error:', err);
          setError(err.message);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  return { borders, loading, error };
}
