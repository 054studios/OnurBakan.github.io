import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import type { NewsItem, AlertItem } from '../types/news';
import { seedNewsIfNeeded } from '../utils/seedNews';

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    seedNewsIfNeeded();

    const unsub = firestore()
      .collection('news')
      .orderBy('publishedAt', 'desc')
      .onSnapshot(
        (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NewsItem));
          setNews(items);
          setLoading(false);
        },
        (err) => {
          console.warn('[useNews] snapshot error:', err);
          setError(true);
          setLoading(false);
        },
      );

    return unsub;
  }, []);

  return { news, loading, error };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const unsub = firestore()
      .collection('alerts')
      .onSnapshot(
        (snap) => {
          const today = new Date().toISOString().slice(0, 10);
          const active = snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as AlertItem))
            .filter((a) => a.expiresAt >= today);
          setAlerts(active);
        },
        (err) => console.warn('[useAlerts]', err),
      );
    return unsub;
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => [...prev, id]);
  }

  const visible = alerts.filter((a) => !dismissed.includes(a.id));

  return { alerts: visible, dismiss };
}
