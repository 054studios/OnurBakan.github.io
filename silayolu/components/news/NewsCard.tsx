import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import type { NewsItem, NewsCategory } from '../../types/news';

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  visa: Colors.accent2,
  car:  Colors.accent3,
  toll: Colors.warn,
  tips: Colors.accent,
};

const CATEGORY_ICONS: Record<NewsCategory, string> = {
  visa: '🛂',
  car:  '🚗',
  toll: '💶',
  tips: '💡',
};

const LANG_BG: Record<string, string> = {
  TR: '#C4390A22',
  NL: '#1B4F8A22',
  DE: '#2E7D4F22',
  FR: '#D4820A22',
  EN: '#6A5E5022',
};
const LANG_COLOR: Record<string, string> = {
  TR: Colors.accent,
  NL: Colors.accent2,
  DE: Colors.accent3,
  FR: Colors.warn,
  EN: Colors.muted,
};

interface NewsCardProps {
  item: NewsItem;
}

function formatDate(ts: any): string {
  if (!ts) return '';
  const d: Date = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NewsCard({ item }: NewsCardProps) {
  const { t } = useTranslation('news');
  const color = CATEGORY_COLORS[item.category] ?? Colors.muted;
  const icon  = CATEGORY_ICONS[item.category]  ?? '📰';

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.topRow}>
        <View style={[styles.catPill, { backgroundColor: color + '22' }]}>
          <Text style={styles.catIcon}>{icon}</Text>
          <Text style={[styles.catText, { color }]}>
            {t(`categories.${item.category}`)}
          </Text>
        </View>
        {item.isCommunity && (
          <View style={styles.communityPill}>
            <Text style={styles.communityText}>👥 Community</Text>
          </View>
        )}
        <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.excerpt} numberOfLines={3}>{item.excerpt}</Text>

      <View style={styles.footer}>
        <View style={styles.langRow}>
          {item.languages.map((lang) => (
            <View
              key={lang}
              style={[styles.langBadge, { backgroundColor: LANG_BG[lang] ?? '#88888822' }]}
            >
              <Text style={[styles.langText, { color: LANG_COLOR[lang] ?? Colors.muted }]}>
                {lang}
              </Text>
            </View>
          ))}
        </View>
        {item.source ? (
          <Text style={styles.source} numberOfLines={1}>
            {t('card.source')}: {item.source}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 7,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catIcon: {
    fontSize: 12,
  },
  catText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  communityPill: {
    backgroundColor: Colors.gold + '22',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  communityText: {
    fontFamily: FontFamily.condensedMedium,
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
  date: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginLeft: 'auto',
  },
  title: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    lineHeight: 22,
  },
  excerpt: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.muted,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  langRow: {
    flexDirection: 'row',
    gap: 5,
  },
  langBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  langText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
  },
  source: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.muted,
    flex: 1,
    textAlign: 'right',
  },
});
