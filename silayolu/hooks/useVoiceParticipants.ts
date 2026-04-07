import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import type { VoiceParticipant } from '../store/voiceStore';

/**
 * Real-time participant list for a specific voice channel,
 * sourced from Firestore presence (richer than Agora events alone).
 */
export function useVoiceParticipants(channelId: string): VoiceParticipant[] {
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);

  useEffect(() => {
    if (!channelId) return;

    const unsubscribe = firestore()
      .collection('voiceRooms')
      .doc(channelId)
      .collection('participants')
      .onSnapshot(
        (snap) => {
          const list: VoiceParticipant[] = snap.docs.map((doc) => {
            const d = doc.data();
            return {
              uid: doc.id,
              agoraUid: d.agoraUid ?? 0,
              name: d.name ?? 'Kullanıcı',
              countryIndex: d.countryIndex ?? 0,
            };
          });
          setParticipants(list);
        },
        (err) => console.warn('[useVoiceParticipants]', err),
      );

    return unsubscribe;
  }, [channelId]);

  return participants;
}
