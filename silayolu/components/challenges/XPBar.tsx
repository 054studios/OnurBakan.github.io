import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { getLevel, getLevelProgress } from '../../constants/challenges';

interface XPBarProps {
  totalXP: number;
}

export default function XPBar({ totalXP }: XPBarProps) {
  const { t } = useTranslation('challenges');
  const level = getLevel(totalXP);
  const { current, max } = getLevelProgress(totalXP);
  const progress = current / max;

  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.level}>{t('xpLevel', { level })}</Text>
        <Text style={styles.xpText}>{t('xpProgress', { current, max })}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  level: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  xpText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  track: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
});
