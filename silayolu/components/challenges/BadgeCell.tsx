import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { BadgeDef, RARITY_COLORS } from '../../constants/challenges';

interface BadgeCellProps {
  badge: BadgeDef;
  earned: boolean;
}

export default function BadgeCell({ badge, earned }: BadgeCellProps) {
  const { t } = useTranslation('challenges');
  const rarityColor = RARITY_COLORS[badge.rarity];

  return (
    <View style={[styles.container, !earned && styles.locked]}>
      <View
        style={[
          styles.iconWrap,
          earned ? { borderColor: rarityColor } : styles.lockedBorder,
        ]}
      >
        <Text style={[styles.emoji, !earned && styles.lockedEmoji]}>
          {earned ? badge.emoji : '🔒'}
        </Text>
        {earned && (
          <View style={[styles.glow, { backgroundColor: rarityColor + '33' }]} />
        )}
      </View>
      <Text style={[styles.name, !earned && styles.lockedText]} numberOfLines={2}>
        {badge.name}
      </Text>
      <Text style={[styles.rarity, { color: earned ? rarityColor : Colors.muted }]}>
        {t(`badges.rarity.${badge.rarity}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  locked: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lockedBorder: {
    borderColor: Colors.border,
  },
  emoji: {
    fontSize: 30,
  },
  lockedEmoji: {
    fontSize: 26,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  name: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.xs,
    color: Colors.ink,
    textAlign: 'center',
    lineHeight: 14,
  },
  lockedText: {
    color: Colors.muted,
  },
  rarity: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
