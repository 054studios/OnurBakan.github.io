import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBorders } from '../../hooks/useBorders';
import { RouteProgress } from '../../components/borders/RouteProgress';
import { BorderCard } from '../../components/borders/BorderCard';
import { SkeletonList, SkeletonProgress } from '../../components/borders/SkeletonCard';
import { ReportSheet } from '../../components/borders/ReportSheet';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import type { BorderDoc } from '../../types';

// ─── Header ───────────────────────────────────────────────────────────────────

function ScreenHeader() {
  const { t } = useTranslation('borders');
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('title')}</Text>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation('borders');
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>🚧</Text>
      <Text style={styles.emptyText}>{t('empty')}</Text>
    </View>
  );
}

// ─── FAB ──────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.fabIcon}>+</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type ListItem =
  | { type: 'progress' }
  | { type: 'border'; data: BorderDoc };

export default function BordersScreen() {
  const { borders, loading } = useBorders();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh: Firestore onSnapshot is real-time, so a cosmetic delay suffices
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // Build flat data for FlatList (progress card + border cards)
  const listData: ListItem[] = loading
    ? []
    : [
        { type: 'progress' },
        ...borders.map((b): ListItem => ({ type: 'border', data: b })),
      ];

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    if (item.type === 'progress') {
      return <RouteProgress />;
    }
    return <BorderCard border={item.data} onPress={() => setSheetOpen(true)} />;
  };

  const keyExtractor = (item: ListItem, index: number) =>
    item.type === 'progress' ? 'progress' : item.data.id;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScreenHeader />

      {loading ? (
        // Skeleton state
        <View style={styles.skeletonWrap}>
          <SkeletonProgress />
          <SkeletonList count={4} />
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.accent}
              colors={[Colors.accent]}
            />
          }
        />
      )}

      <FAB onPress={() => setSheetOpen(true)} />

      <ReportSheet
        visible={sheetOpen}
        borders={borders}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  headerTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['3xl'],
    color: Colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  listContent: {
    paddingTop: 14,
    paddingBottom: 100, // space for FAB
  },

  skeletonWrap: {
    paddingTop: 14,
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 32 : 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.ink,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.surface,
    lineHeight: 32,
    fontFamily: FontFamily.displayBold,
  },
});
