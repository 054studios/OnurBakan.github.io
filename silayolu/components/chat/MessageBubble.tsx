import { View, Text, StyleSheet } from 'react-native';
import type { ChatMessage } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  showSenderName: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function MessageBubble({ message, isOwn, showSenderName }: Props) {
  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
      {/* Sender name — only for others, only when not a run of same sender */}
      {!isOwn && showSenderName && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}

      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, isOwn ? styles.timestampOwn : styles.timestampOther]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

// ─── Date divider (shown between messages from different days) ─────────────────

interface DividerProps {
  label: string;
}

export function DateDivider({ label }: DividerProps) {
  return (
    <View style={styles.dividerWrap}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    maxWidth: '80%',
  },
  wrapperOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  senderName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.accent2,
    marginBottom: 2,
    marginLeft: 2,
  },

  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  bubbleOwn: {
    backgroundColor: Colors.ink,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },

  text: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    lineHeight: 21,
  },
  textOwn: { color: Colors.surface },
  textOther: { color: Colors.ink },

  timestamp: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  timestampOwn: { color: 'rgba(253, 250, 244, 0.55)' },
  timestampOther: { color: Colors.muted },

  // Date divider
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    fontFamily: FontFamily.displayMedium,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
