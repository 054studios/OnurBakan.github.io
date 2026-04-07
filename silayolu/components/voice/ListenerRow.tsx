import { View, Text, StyleSheet } from 'react-native';
import type { VoiceParticipant } from '../../store/voiceStore';
import { ROUTE_COUNTRIES } from '../../constants/route';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

const AVATAR_COLORS = [Colors.accent2, Colors.accent3, Colors.warn, Colors.gold, Colors.accent];

interface Props {
  participant: VoiceParticipant;
  isSpeaking: boolean;
  isLocal: boolean;
  localLabel: string;
}

export function ListenerRow({ participant, isSpeaking, isLocal, localLabel }: Props) {
  const country = ROUTE_COUNTRIES[participant.countryIndex] ?? ROUTE_COUNTRIES[0];
  const avatarColor = AVATAR_COLORS[participant.agoraUid % AVATAR_COLORS.length];
  const initial = (participant.name[0] ?? '?').toUpperCase();

  return (
    <View style={[styles.row, isSpeaking && styles.rowSpeaking]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initial}</Text>
        {isSpeaking && <View style={styles.speakingDot} />}
      </View>

      {/* Name + location */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, isSpeaking && styles.nameSpeaking]} numberOfLines={1}>
            {participant.name}
            {isLocal && <Text style={styles.youBadge}> ({localLabel})</Text>}
          </Text>
          {isSpeaking && <Text style={styles.speakingIcon}>🎙</Text>}
        </View>
        <Text style={styles.location}>
          {country.flag} {country.nameKey.replace('countries.', '')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowSpeaking: {
    backgroundColor: 'rgba(196, 57, 10, 0.05)',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    color: Colors.surface,
  },
  speakingDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.surface,
  },

  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.md,
    color: Colors.ink,
    flex: 1,
  },
  nameSpeaking: {
    color: Colors.accent,
  },
  youBadge: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  speakingIcon: { fontSize: 14 },

  location: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 1,
  },
});
