import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { useAuthStore } from '../../store/authStore';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import Podium from '../../components/challenges/Podium';
import LeaderboardRow from '../../components/challenges/LeaderboardRow';

type Tab = 'season' | 'allTime' | 'month';

const TABS: Tab[] = ['season', 'allTime', 'month'];

const TAB_LABELS: Record<Tab, string> = {
  season: 'Sezon',
  allTime: 'Tüm Zamanlar',
  month: 'Bu Ay',
};

export default function LeaderboardScreen() {
  const { t } = useTranslation('challenges');
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('season');
  const { entries, loading } = useLeaderboard();

  const podiumEntries = entries.slice(0, 3).map((e) => ({
    rank: e.rank,
    displayName: e.displayName,
    totalXP: e.totalXP,
    isYou: e.userId === user?.uid,
  }));

  const listEntries = entries.slice(3);
  const myEntry = entries.find((e) => e.userId === user?.uid);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('leaderboard.title')}</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t('leaderboard.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={listEntries}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              <Text style={styles.podiumLabel}>{t('leaderboard.podium')}</Text>
              <Podium entries={podiumEntries} youLabel={t('leaderboard.you')} />
              <View style={styles.divider} />
            </>
          }
          renderItem={({ item }) => (
            <LeaderboardRow
              rank={item.rank}
              displayName={item.displayName}
              totalXP={item.totalXP}
              badgeCount={item.earnedBadges.length}
              isYou={item.userId === user?.uid}
              youLabel={t('leaderboard.you')}
            />
          )}
          ListFooterComponent={<View style={{ height: myEntry ? 80 : 20 }} />}
        />
      )}

      {myEntry && !loading && (
        <View style={styles.stickyBar}>
          <Text style={styles.stickyRank}>{t('leaderboard.rank', { rank: myEntry.rank })}</Text>
          <Text style={styles.stickyName}>{myEntry.displayName}</Text>
          <Text style={styles.stickyXP}>{myEntry.totalXP} XP</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    paddingRight: 8,
  },
  backIcon: {
    fontSize: 28,
    color: Colors.ink,
    lineHeight: 28,
  },
  title: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize['2xl'],
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontFamily: FontFamily.condensedMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: Colors.accent,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  list: {
    paddingBottom: 20,
  },
  podiumLabel: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  stickyRank: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: '#fff',
    width: 40,
  },
  stickyName: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: '#fff',
    flex: 1,
  },
  stickyXP: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: '#fff',
  },
});
