import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import type { ChatMessage } from '../types';

const MESSAGE_LIMIT = 120;

interface UseMessagesResult {
  messages: ChatMessage[];
  loading: boolean;
}

/**
 * Real-time messages for a given group.
 * Returns newest-first so FlatList inverted={true} shows them at the bottom.
 */
export function useMessages(groupId: string): UseMessagesResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = firestore()
      .collection('chats')
      .doc(groupId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(MESSAGE_LIMIT)
      .onSnapshot(
        (snapshot) => {
          const docs: ChatMessage[] = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              text: d.text ?? '',
              senderId: d.senderId ?? '',
              senderName: d.senderName ?? 'Bilinmiyor',
              createdAt: d.createdAt?.toDate?.() ?? new Date(),
            };
          });
          setMessages(docs);
          setLoading(false);
        },
        (err) => {
          console.warn('[useMessages] snapshot error:', err);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, [groupId]);

  return { messages, loading };
}
