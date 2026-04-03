import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ListRenderItem,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useMessages } from '../../hooks/useMessages';
import { CHAT_GROUPS_SEED } from '../../utils/seedChat';
import { MessageBubble, DateDivider } from '../../components/chat/MessageBubble';
import type { ChatMessage } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateDividerLabel(date: Date, todayLabel: string, yesterdayLabel: string): string {
  const now = new Date();
  if (isSameDay(date, now)) return todayLabel;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return yesterdayLabel;
  return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── List item types ──────────────────────────────────────────────────────────

type ListItem =
  | { type: 'message'; data: ChatMessage; isOwn: boolean; showSenderName: boolean }
  | { type: 'divider'; label: string; key: string };

function buildListItems(
  messages: ChatMessage[],
  myUid: string | null | undefined,
  todayLabel: string,
  yesterdayLabel: string,
): ListItem[] {
  // messages is newest-first (from useMessages), FlatList is inverted,
  // so we process from newest-first and insert dividers between day boundaries.
  const items: ListItem[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const next = messages[i + 1]; // next in array = older message

    const isOwn = !!myUid && msg.senderId === myUid;

    // Show sender name when the previous message (newer, i-1) is from a different sender
    const prev = messages[i - 1];
    const showSenderName = !isOwn && (!prev || prev.senderId !== msg.senderId);

    items.push({ type: 'message', data: msg, isOwn, showSenderName });

    // Insert divider between this message and the next if they're on different days
    if (next && !isSameDay(msg.createdAt, next.createdAt)) {
      items.push({
        type: 'divider',
        label: dateDividerLabel(next.createdAt, todayLabel, yesterdayLabel),
        key: `divider-${next.createdAt.toDateString()}`,
      });
    }

    // Insert divider at the oldest message boundary
    if (!next) {
      items.push({
        type: 'divider',
        label: dateDividerLabel(msg.createdAt, todayLabel, yesterdayLabel),
        key: `divider-top-${msg.createdAt.toDateString()}`,
      });
    }
  }

  return items;
}

// ─── Custom header ────────────────────────────────────────────────────────────

interface HeaderProps {
  groupId: string;
}

function ChatHeader({ groupId }: HeaderProps) {
  const router = useRouter();
  const seed = CHAT_GROUPS_SEED.find((g) => g.id === groupId);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerEmoji}>{seed?.emoji ?? '💬'}</Text>
        <Text style={styles.headerName} numberOfLines={1}>
          {seed?.name ?? groupId}
        </Text>
      </View>

      {/* Spacer to keep name centred */}
      <View style={styles.backBtn} />
    </View>
  );
}

// ─── Input bar ────────────────────────────────────────────────────────────────

interface InputBarProps {
  groupId: string;
  isGuest: boolean;
}

function InputBar({ groupId, isGuest }: InputBarProps) {
  const { t } = useTranslation('chat');
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    if (isGuest || !user) {
      Alert.alert('', t('detail.guestWarning'));
      return;
    }

    setSending(true);
    setText('');

    try {
      const messageRef = firestore()
        .collection('chats')
        .doc(groupId)
        .collection('messages')
        .doc();

      const groupRef = firestore().collection('chatGroups').doc(groupId);

      const batch = firestore().batch();

      batch.set(messageRef, {
        text: trimmed,
        senderId: user.uid,
        senderName: user.displayName ?? user.email ?? 'Kullanıcı',
        createdAt: firestore.Timestamp.now(),
      });

      batch.update(groupRef, {
        lastMessage: trimmed,
        lastMessageAt: firestore.Timestamp.now(),
        memberCount: firestore.FieldValue.increment(1),
      });

      await batch.commit();
    } catch (err) {
      console.warn('[InputBar] send error:', err);
      setText(trimmed); // restore on error
    } finally {
      setSending(false);
    }
  };

  const canSend = text.trim().length > 0 && !sending;

  return (
    <View style={styles.inputBar}>
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder={isGuest ? t('detail.guestWarning') : t('detail.placeholder')}
        placeholderTextColor={Colors.border}
        multiline
        maxLength={500}
        returnKeyType="default"
        editable={!isGuest}
        onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSend}
      />
      <TouchableOpacity
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.8}
      >
        {sending ? (
          <ActivityIndicator color={Colors.surface} size="small" />
        ) : (
          <Text style={styles.sendIcon}>↑</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChatDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { t } = useTranslation('chat');
  const { user, isGuest } = useAuthStore();
  const { markRead } = useChatStore();
  const { messages, loading } = useMessages(groupId ?? '');

  // Mark as read when we enter this screen
  useEffect(() => {
    if (groupId) markRead(groupId);
  }, [groupId]);

  if (!groupId) return null;

  const listItems = buildListItems(
    messages,
    user?.uid,
    t('detail.today'),
    t('detail.yesterday'),
  );

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    if (item.type === 'divider') {
      return <DateDivider label={item.label} />;
    }
    return (
      <MessageBubble
        message={item.data}
        isOwn={item.isOwn}
        showSenderName={item.showSenderName}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <ChatHeader groupId={groupId} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.accent} size="large" />
            <Text style={styles.loadingText}>{t('detail.loadingMessages')}</Text>
          </View>
        ) : (
          <FlatList
            data={listItems}
            renderItem={renderItem}
            keyExtractor={(item, idx) =>
              item.type === 'message' ? item.data.id : item.key
            }
            inverted
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Text style={styles.emptyMessagesText}>{t('detail.emptyMessages')}</Text>
              </View>
            }
          />
        )}

        <InputBar groupId={groupId} isGuest={isGuest} />
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: Platform.OS === 'android' ? 12 : 56,
  },
  backBtn: {
    width: 40,
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.ink,
    fontFamily: FontFamily.bodyBold,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerEmoji: { fontSize: 22 },
  headerName: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Messages
  messageList: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  emptyMessages: {
    // inverted FlatList: this appears at the "bottom" (visually top of screen when empty)
    transform: [{ scaleY: -1 }],
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyMessagesText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.ink,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  sendIcon: {
    color: Colors.surface,
    fontSize: 18,
    fontFamily: FontFamily.displayBold,
    lineHeight: 20,
  },
});
