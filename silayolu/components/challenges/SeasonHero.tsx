import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { CHALLENGES, SEASON } from '../../constants/challenges';

interface SeasonHeroProps {
  completedChallengeIds: string[];
}

export default function SeasonHero({ completedChallengeIds }: SeasonHeroProps) {
  const { t } = useTranslation('challenges');
  const required = SEASON.requiredChallengeIds;
  const completedCount = required.filter((id) => completedChallengeIds.includes(id)).length;
  const total = required.length;
  const ratio = total > 0 ? completedCount / total : 0;
  const isComplete = completedCount >= total;

  const widthAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: ratio,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  useEffect(() => {
    if (!isComplete) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ]),
    ).start();
  }, [isComplete]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <View style={styles.card}>
      {isComplete && (
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
      )}
      <View style={styles.header}>
        <Text style={styles.trophy}>🏆</Text>
        <View style={styles.headerText}>
          <Text style={styles.season}>{t('season')}</Text>
          <Text style={styles.title}>{SEASON.name}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{SEASON.xpBonus} XP</Text>
        </View>
      </View>

      <Text style={[styles.progress, isComplete && styles.progressComplete]}>
        {isComplete ? t('seasonComplete') : t('seasonProgress', { count: completedCount })}
      </Text>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            isComplete && styles.fillComplete,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.checklist}>
        {CHALLENGES.map((c) => {
          const done = completedChallengeIds.includes(c.id);
          return (
            <View key={c.id} style={styles.checkRow}>
              <Text style={[styles.checkIcon, done ? styles.checkDone : styles.checkPending]}>
                {done ? '✓' : '○'}
              </Text>
              <Text style={[styles.checkName, !done && styles.checkNamePending]}>
                {c.emoji} {c.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: Colors.ink,
    borderRadius: 18,
    padding: 18,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: Colors.gold,
    borderRadius: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  trophy: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  season: {
    fontFamily: FontFamily.condensedMedium,
    fontSize: FontSize.xs,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.xl,
    color: '#FDFAF4',
    lineHeight: 22,
  },
  xpBadge: {
    backgroundColor: Colors.gold + '33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gold + '66',
  },
  xpText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
  progress: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#C8BBAA',
    marginBottom: 8,
  },
  progressComplete: {
    color: Colors.gold,
  },
  track: {
    height: 7,
    backgroundColor: '#3A342C',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  fillComplete: {
    backgroundColor: Colors.gold,
  },
  checklist: {
    gap: 5,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIcon: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    width: 16,
    textAlign: 'center',
  },
  checkDone: {
    color: Colors.accent3,
  },
  checkPending: {
    color: '#5A5045',
  },
  checkName: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#C8BBAA',
  },
  checkNamePending: {
    color: '#6A5E50',
  },
});
