import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import type { AlertItem } from '../types/news';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // On Android, a notification channel is required
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('border-alerts', {
      name: 'Sınır Uyarıları',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C4390A',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

/**
 * Watches Firestore "alerts" collection for critical/warning items and
 * fires a local push notification for any new ones that appear.
 */
export function useBorderAlertNotifications(userId: string | null) {
  const tokenRef = useRef<string | null>(null);
  const seenAlertsRef = useRef<Set<string>>(new Set());
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Register for push
    registerForPushNotifications()
      .then((token) => {
        tokenRef.current = token;
        // Persist token to Firestore so backend can target this user
        if (token && userId) {
          firestore()
            .collection('pushTokens')
            .doc(userId)
            .set({ token, updatedAt: firestore.Timestamp.now() }, { merge: true })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // Listen for notifications while app is open
    notifListener.current = Notifications.addNotificationReceivedListener((_n) => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener((_r) => {});

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);

  useEffect(() => {
    // Watch Firestore alerts and fire local notifications for new critical/warning ones
    const today = new Date().toISOString().slice(0, 10);

    const unsub = firestore()
      .collection('alerts')
      .where('severity', 'in', ['warning', 'critical'])
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type !== 'added') return;
          const alert = { id: change.doc.id, ...change.doc.data() } as AlertItem;

          // Skip expired or already-seen
          if (alert.expiresAt < today) return;
          if (seenAlertsRef.current.has(alert.id)) return;
          seenAlertsRef.current.add(alert.id);

          // Skip the very first load (don't notify for pre-existing alerts)
          if (snap.metadata.hasPendingWrites === false && !snap.metadata.fromCache) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: '⚠️ Sınır Uyarısı',
                body: alert.message,
                data: { alertId: alert.id },
                channelId: 'border-alerts',
              },
              trigger: null, // send immediately
            }).catch(() => {});
          }
        });
      });

    return unsub;
  }, []);
}
