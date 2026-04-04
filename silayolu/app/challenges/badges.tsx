import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { BADGES } from '../../constants/challenges';
import { useProgressStore } from '../../store/progressStore';
import BadgeCell from '../../components/challenges/BadgeCell';

const COLS = 3;

export default function BadgesScreen() {
  const { t } = useTranslation('challenges');
  const router = useRouter();
  const { earnedBadges } = useProgressStore();
  const earnedCount = earnedBadges.length;

  // Pad to fill the last row
  const padded = [...BADGES];
  while (padded.length % COLS !== 0) {
    padded.push(null as any);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('badges.title')}</Text>
      </View>
      <View style={styles.strip}>
        <Text style={styles.stripText}>
          🏅 {t('badges.earned', { count: earnedCount })}
        </Text>
        <Text style={styles.totalText}>/ {BADGES.length}</Text>
      </View>
      <FlatList
        data={padded}
        keyExtractor={(item, idx) => item?.id ?? `pad-${idx}`}
        numColumns={COLS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          if (!item) return <View style={styles.emptyCell} />;
          return (
            <View style={styles.cell}>
              <BadgeCell badge={item} earned={earnedBadges.includes(item.id)} />
            </View>
          );
        }}
      />
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
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.gold + '18',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gold + '44',
  },
  stripText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.gold,
  },
  totalText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  grid: {
    padding: 12,
    paddingBottom: 40,
  },
  row: {
    gap: 4,
  },
  cell: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    margin: 4,
  },
  emptyCell: {
    flex: 1,
    margin: 4,
  },
});
