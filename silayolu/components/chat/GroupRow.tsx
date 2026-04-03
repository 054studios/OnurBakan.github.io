import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ChatGroup } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

interface Props {
  group: ChatGroup;
  onPress: () => void;
}

function relativeTime(date: Date | null, t: ReturnType<typeof useTranslation>['t']): string {
  if (!date) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return t('time.justNow');
  if (diffMin < 60) return t('time.minutesAgo', { count: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return t('time.hoursAgo', { count: diffHr });
  return t('time.daysAgo', { count: Math.floor(diffHr / 24) });
}

export function GroupRow({ group, onPress }: Props) {
  const { t } = useTranslation('chat');
  const lastReadAt = useChatStore((s) => s.lastReadAt);

  // Unread: lastMessageAt is newer than what we last read
  const isUnread =
    group.lastMessageAt !== null &&
    (!lastReadAt[group.id] || group.lastMessageAt > lastReadAt[group.id]);

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.75} onPress={onPress}>
      {/* Emoji avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{group.emoji}</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text style={[styles.groupName, isUnread && styles.groupNameUnread]} numberOfLines={1}>
            {group.name}
          </Text>
          {group.lastMessageAt && (
            <Text style={styles.timeText}>
              {relativeTime(group.lastMessageAt, t)}
            </Text>
          )}
        </View>

        <View style={styles.bottomLine}>
          <Text
            style={[styles.lastMessage, isUnread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {group.lastMessage ?? t('groups.noMessages')}
          </Text>

          {isUnread ? (
            <View style={styles.unreadDot} />
          ) : (
            <Text style={styles.memberCount}>
              {t('groups.members', { count: group.memberCount })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 26 },

  content: { flex: 1, gap: 4 },

  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  groupName: {
    flex: 1,
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    letterSpacing: 0.2,
  },
  groupNameUnread: {
    fontFamily: FontFamily.displayBold,
  },
  timeText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.muted,
    flexShrink: 0,
  },

  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
    lineHeight: 18,
  },
  lastMessageUnread: {
    color: Colors.ink,
    fontFamily: FontFamily.bodySemiBold,
  },
  memberCount: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.muted,
    flexShrink: 0,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    flexShrink: 0,
  },
});
