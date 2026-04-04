import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { ChallengeDef } from '../../constants/challenges';

type Status = 'locked' | 'inProgress' | 'complete';

interface ChallengeCardProps {
  challenge: ChallengeDef;
  status: Status;
  completedTasks: number;
  onPress: () => void;
}

const STATUS_COLORS: Record<Status, string> = {
  locked: Colors.muted,
  inProgress: Colors.accent2,
  complete: Colors.accent3,
};

const TYPE_COLORS: Record<string, string> = {
  route: Colors.accent2,
  community: Colors.accent3,
  speed: Colors.accent,
  distance: Colors.warn,
};

export default function ChallengeCard({ challenge, status, completedTasks, onPress }: ChallengeCardProps) {
  const { t } = useTranslation('challenges');
  const total = challenge.tasks.length;
  const progressRatio = total > 0 ? completedTasks / total : 0;
  const statusColor = STATUS_COLORS[status];
  const typeColor = TYPE_COLORS[challenge.type] ?? Colors.muted;
  const isLocked = status === 'locked';

  return (
    <TouchableOpacity
      style={[styles.card, isLocked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <Text style={[styles.emoji, isLocked && styles.dimmed]}>{challenge.emoji}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, isLocked && styles.dimmed]}>{challenge.name}</Text>
          <View style={[styles.typePill, { backgroundColor: typeColor + '22' }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>
              {t(`type.${challenge.type}`)}
            </Text>
          </View>
        </View>
        <Text style={[styles.desc, isLocked && styles.dimmed]} numberOfLines={2}>
          {challenge.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.trackWrap}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progressRatio * 100}%`, backgroundColor: statusColor }]} />
            </View>
            <Text style={styles.taskCount}>{completedTasks}/{total}</Text>
          </View>
          <View style={[styles.xpPill, { backgroundColor: Colors.gold + '22' }]}>
            <Text style={styles.xpText}>{t('xpReward', { xp: challenge.xpReward })}</Text>
          </View>
        </View>
        {isLocked && challenge.unlockCondition && (
          <Text style={styles.unlockHint}>{t('unlockCondition')} {challenge.unlockCondition}</Text>
        )}
      </View>
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  cardLocked: {
    opacity: 0.7,
  },
  left: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  emoji: {
    fontSize: 28,
  },
  dimmed: {
    opacity: 0.6,
  },
  body: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.ink,
    flex: 1,
  },
  typePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontFamily: FontFamily.condensedMedium,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  desc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.muted,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  trackWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  track: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  taskCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.muted,
    minWidth: 28,
  },
  xpPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
  statusBar: {
    width: 4,
  },
  unlockHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.warn,
    marginTop: 2,
  },
});
