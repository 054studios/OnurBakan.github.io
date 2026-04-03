import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { VoiceChannel } from '../../constants/voice';
import type { ChannelPresence } from '../../hooks/useVoiceChannels';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

// ─── Live badge (pulsing dot) ─────────────────────────────────────────────────

function LiveBadge() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={badge.wrap}>
      <Animated.View style={[badge.dot, { opacity: pulse }]} />
      <Text style={badge.label}>LIVE</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.accent },
  label: {
    fontFamily: FontFamily.displayBold,
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 1,
  },
});

// ─── Avatar stack (up to 3 circles + overflow count) ─────────────────────────

const AVATAR_COLORS = [Colors.accent2, Colors.accent3, Colors.warn, Colors.gold];

function AvatarStack({ names }: { names: string[] }) {
  const visible = names.slice(0, 3);
  const overflow = names.length - visible.length;

  if (names.length === 0) return null;

  return (
    <View style={avatars.row}>
      {visible.map((name, i) => (
        <View
          key={i}
          style={[
            avatars.circle,
            { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], marginLeft: i > 0 ? -8 : 0 },
          ]}
        >
          <Text style={avatars.initial}>{(name[0] ?? '?').toUpperCase()}</Text>
        </View>
      ))}
      {overflow > 0 && (
        <View style={[avatars.circle, avatars.overflow, { marginLeft: -8 }]}>
          <Text style={avatars.overflowText}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

const avatars = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  initial: {
    fontFamily: FontFamily.displayBold,
    fontSize: 11,
    color: Colors.surface,
  },
  overflow: { backgroundColor: Colors.muted },
  overflowText: {
    fontFamily: FontFamily.displayBold,
    fontSize: 9,
    color: Colors.surface,
  },
});

// ─── Channel card ─────────────────────────────────────────────────────────────

interface Props {
  channel: VoiceChannel;
  presence: ChannelPresence;
  onPress: () => void;
}

export function ChannelCard({ channel, presence, onPress }: Props) {
  const { t } = useTranslation('voice');
  const isLive = presence.listenerCount > 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      {/* Left accent strip */}
      <View style={[styles.strip, isLive && styles.stripLive]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.emoji}>{channel.emoji}</Text>
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>{channel.name}</Text>
            <Text style={styles.route}>{channel.route}</Text>
          </View>
          {isLive && <LiveBadge />}
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <Text style={styles.listenerCount}>
            {presence.listenerCount > 0
              ? t('listeners', { count: presence.listenerCount })
              : t('noListeners')}
          </Text>
          <AvatarStack names={presence.activeNames} />
        </View>
      </View>

      {/* PTT icon hint */}
      <Text style={styles.pttHint}>🎙</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  strip: { width: 4, alignSelf: 'stretch', backgroundColor: Colors.border },
  stripLive: { backgroundColor: Colors.accent },
  body: { flex: 1, padding: 14, gap: 8 },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji: { fontSize: 28 },
  nameBlock: { flex: 1 },
  name: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    letterSpacing: 0.2,
  },
  route: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 1,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listenerCount: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },

  pttHint: { fontSize: 22, paddingRight: 14 },
});
