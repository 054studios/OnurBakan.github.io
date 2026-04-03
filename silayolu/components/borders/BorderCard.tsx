import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BorderDoc, WaitBucket } from '../../types';
import { waitBucket } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

interface Props {
  border: BorderDoc;
  onPress?: () => void;
}

// ─── Relative time ────────────────────────────────────────────────────────────

function relativeTime(date: Date, t: ReturnType<typeof useTranslation>['t']): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return t('time.justNow');
  if (diffMin < 60) return t('time.minutesAgo', { count: diffMin });

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return t('time.hoursAgo', { count: diffHr });

  return t('time.daysAgo', { count: Math.floor(diffHr / 24) });
}

// ─── Wait badge ───────────────────────────────────────────────────────────────

const BUCKET_COLORS: Record<WaitBucket, { bg: string; text: string }> = {
  low:     { bg: '#E6F4EC', text: Colors.accent3 },
  medium:  { bg: '#FEF3E2', text: Colors.warn },
  high:    { bg: '#FEE8E2', text: Colors.accent },
  unknown: { bg: Colors.bg, text: Colors.muted },
};

function WaitBadge({ mins, t }: { mins: number | null; t: ReturnType<typeof useTranslation>['t'] }) {
  const bucket = waitBucket(mins);
  const { bg, text } = BUCKET_COLORS[bucket];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {mins !== null ? (
        <>
          <Text style={[styles.badgeNum, { color: text }]}>{mins}</Text>
          <Text style={[styles.badgeUnit, { color: text }]}>{t('card.waitUnit')}</Text>
        </>
      ) : (
        <Text style={[styles.badgeUnknown, { color: text }]}>{t('card.unknown')}</Text>
      )}
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function BorderCard({ border, onPress }: Props) {
  const { t } = useTranslation('borders');
  const bucket = waitBucket(border.waitTimeMinutes);
  const bucketColors = BUCKET_COLORS[bucket];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Left accent strip keyed to wait bucket */}
      <View style={[styles.strip, { backgroundColor: bucketColors.text }]} />

      <View style={styles.body}>
        {/* Top row: flags + name + badge */}
        <View style={styles.topRow}>
          <View style={styles.flagBlock}>
            <Text style={styles.flag}>{border.fromFlag}</Text>
            <Text style={styles.arrow}>↔</Text>
            <Text style={styles.flag}>{border.toFlag}</Text>
          </View>

          <Text style={styles.borderName} numberOfLines={1}>{border.name}</Text>

          <WaitBadge mins={border.waitTimeMinutes} t={t} />
        </View>

        {/* Bottom row: reports + last updated */}
        <View style={styles.bottomRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>
              {border.reportCount} {t('card.reports')}
            </Text>
          </View>

          <View style={styles.metaDot} />

          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>
              {t('card.lastUpdated')} {relativeTime(border.updatedAt, t)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  strip: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 8,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  flag: { fontSize: 22 },
  arrow: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  borderName: {
    flex: 1,
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    letterSpacing: 0.3,
  },

  // Wait badge
  badge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 2,
  },
  badgeNum: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.xl,
    lineHeight: 22,
  },
  badgeUnit: {
    fontFamily: FontFamily.displayMedium,
    fontSize: FontSize.xs,
    lineHeight: 14,
  },
  badgeUnknown: {
    fontFamily: FontFamily.displayMedium,
    fontSize: FontSize.xs,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaIcon: { fontSize: 11 },
  metaText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.border,
  },
});
