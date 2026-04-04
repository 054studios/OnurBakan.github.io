import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { useNews, useAlerts } from '../../hooks/useNews';
import AlertBanner from '../../components/news/AlertBanner';
import FilterChips, { type FilterValue } from '../../components/news/FilterChip';
import NewsCard from '../../components/news/NewsCard';
import TipSheet from '../../components/news/TipSheet';
import { SkeletonNewsList } from '../../components/news/SkeletonNews';
import type { NewsItem } from '../../types/news';

// ─── FAB ──────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation('news');
  return (
    <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.fabIcon}>+</Text>
      <Text style={styles.fabLabel}>{t('fab')}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NewsScreen() {
  const { t } = useTranslation('news');
  const { news, loading, error } = useNews();
  const { alerts, dismiss } = useAlerts();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filtered: NewsItem[] =
    filter === 'all' ? news : news.filter((n) => n.category === filter);

  function onRefresh() {
    setRefreshing(true);
    // Firestore onSnapshot auto-updates; just reset the spinner after a beat
    setTimeout(() => setRefreshing(false), 1000);
  }

  type ListItem =
    | { type: 'alerts' }
    | { type: 'filters' }
    | { type: 'news'; data: NewsItem }
    | { type: 'empty' }
    | { type: 'error' };

  const listItems: ListItem[] = [
    { type: 'alerts' },
    { type: 'filters' },
    ...(loading
      ? []
      : error
      ? [{ type: 'error' } as ListItem]
      : filtered.length === 0
      ? [{ type: 'empty' } as ListItem]
      : filtered.map((n) => ({ type: 'news', data: n } as ListItem))),
  ];

  function renderItem({ item }: { item: ListItem }) {
    switch (item.type) {
      case 'alerts':
        return (
          <View>
            {alerts.map((a) => (
              <AlertBanner key={a.id} alert={a} onDismiss={() => dismiss(a.id)} />
            ))}
          </View>
        );
      case 'filters':
        return <FilterChips active={filter} onChange={setFilter} />;
      case 'news':
        return <NewsCard item={item.data} />;
      case 'empty':
        return (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📰</Text>
            <Text style={styles.emptyText}>{t('empty')}</Text>
          </View>
        );
      case 'error':
        return (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyText}>{t('loadError')}</Text>
          </View>
        );
      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('title')}</Text>
      </View>

      {loading ? (
        <View style={styles.skeletonWrap}>
          <SkeletonNewsList count={3} />
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item, idx) => {
            if (item.type === 'news') return item.data.id;
            return `${item.type}-${idx}`;
          }}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
              colors={[Colors.accent]}
            />
          }
        />
      )}

      <FAB onPress={() => setSheetOpen(true)} />

      <TipSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.bg,
  },
  headerTitle: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize['2xl'],
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  content: {
    paddingBottom: 100,
  },
  skeletonWrap: {
    paddingTop: 12,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 13,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 20,
    color: '#fff',
    fontFamily: FontFamily.condensedBold,
    lineHeight: 22,
  },
  fabLabel: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
