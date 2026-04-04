import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import type { AlertItem } from '../../types/news';

const SEVERITY_COLORS = {
  info:     { bg: Colors.accent2 + '18', border: Colors.accent2, icon: 'ℹ️' },
  warning:  { bg: Colors.warn + '18',    border: Colors.warn,    icon: '⚠️' },
  critical: { bg: Colors.accent + '18',  border: Colors.accent,  icon: '🚨' },
};

interface AlertBannerProps {
  alert: AlertItem;
  onDismiss: () => void;
}

export default function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const { t } = useTranslation('news');
  const cfg = SEVERITY_COLORS[alert.severity] ?? SEVERITY_COLORS.info;
  const slideAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: cfg.bg, borderLeftColor: cfg.border },
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.icon}>{cfg.icon}</Text>
      <Text style={[styles.message, { color: cfg.border }]} numberOfLines={3}>
        {alert.message}
      </Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.dismiss, { color: cfg.border }]}>{t('alert.dismiss')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  icon: {
    fontSize: 18,
  },
  message: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  dismiss: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
