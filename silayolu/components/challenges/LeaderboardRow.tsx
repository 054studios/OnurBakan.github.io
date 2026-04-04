import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

interface LeaderboardRowProps {
  rank: number;
  displayName: string;
  totalXP: number;
  badgeCount: number;
  isYou: boolean;
  youLabel: string;
}

export default function LeaderboardRow({
  rank,
  displayName,
  totalXP,
  badgeCount,
  isYou,
  youLabel,
}: LeaderboardRowProps) {
  return (
    <View style={[styles.row, isYou && styles.rowYou]}>
      <Text style={[styles.rank, isYou && styles.rankYou]}>#{rank}</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, isYou && styles.nameYou]} numberOfLines={1}>
          {displayName}
          {isYou && <Text style={styles.you}> {youLabel}</Text>}
        </Text>
        <Text style={styles.badges}>🏅 {badgeCount}</Text>
      </View>
      <Text style={[styles.xp, isYou && styles.xpYou]}>{totalXP} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowYou: {
    backgroundColor: Colors.accent + '12',
  },
  rank: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.muted,
    width: 36,
    textAlign: 'right',
  },
  rankYou: {
    color: Colors.accent,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent2 + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.accent2,
  },
  info: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  nameYou: {
    color: Colors.accent,
  },
  you: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  badges: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  xp: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.gold,
  },
  xpYou: {
    color: Colors.accent,
  },
});
