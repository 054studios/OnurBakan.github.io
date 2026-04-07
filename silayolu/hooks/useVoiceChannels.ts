import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { VOICE_CHANNELS } from '../constants/voice';

export interface ChannelPresence {
  channelId: string;
  listenerCount: number;
  /** Display names of active users, truncated for avatar stack */
  activeNames: string[];
}

/**
 * Subscribes to the voiceRooms/{channelId}/participants sub-collection for
 * each pre-defined voice channel and returns real-time listener counts.
 */
export function useVoiceChannels(): { presence: ChannelPresence[]; loading: boolean } {
  const [presence, setPresence] = useState<ChannelPresence[]>(
    VOICE_CHANNELS.map((c) => ({ channelId: c.id, listenerCount: 0, activeNames: [] })),
  );
  const [loading, setLoading] = useState(true);
  const resolvedRef = { count: 0 };

  useEffect(() => {
    const unsubs = VOICE_CHANNELS.map((channel) =>
      firestore()
        .collection('voiceRooms')
        .doc(channel.id)
        .collection('participants')
        .onSnapshot(
          (snap) => {
            const names = snap.docs.map(
              (d) => (d.data().name as string) ?? 'Kullanıcı',
            );
            setPresence((prev) =>
              prev.map((p) =>
                p.channelId === channel.id
                  ? { ...p, listenerCount: snap.size, activeNames: names }
                  : p,
              ),
            );
            resolvedRef.count += 1;
            if (resolvedRef.count >= VOICE_CHANNELS.length) setLoading(false);
          },
          (err) => {
            console.warn('[useVoiceChannels]', err);
            setLoading(false);
          },
        ),
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  return { presence, loading };
}
