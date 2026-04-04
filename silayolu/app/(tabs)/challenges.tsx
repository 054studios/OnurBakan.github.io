import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { CHALLENGES } from '../../constants/challenges';
import { useProgressStore } from '../../store/progressStore';
import SeasonHero from '../../components/challenges/SeasonHero';
import ChallengeCard from '../../components/challenges/ChallengeCard';
import XPBar from '../../components/challenges/XPBar';

type ChallengeStatus = 'locked' | 'inProgress' | 'complete';

function getStatus(
  challengeId: string,
  completedChallenges: string[],
  completedTasks: string[],
): ChallengeStatus {
  if (completedChallenges.includes(challengeId)) return 'complete';
  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) return 'locked';
  const hasAnyTask = challenge.tasks.some((t) =>
    completedTasks.includes(`${challengeId}:${t.id}`),
  );
  return hasAnyTask ? 'inProgress' : 'locked';
}

export default function ChallengesScreen() {
  const { t } = useTranslation('challenges');
  const router = useRouter();
  const { completedChallenges, completedTasks, totalXP } = useProgressStore();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList
        data={CHALLENGES}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <Text style={styles.screenTitle}>{t('title')}</Text>
              <View style={styles.quickLinks}>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => router.push('/challenges/badges')}
                >
                  <Text style={styles.linkText}>{t('quickLinks.badges')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => router.push('/challenges/leaderboard')}
                >
                  <Text style={styles.linkText}>{t('quickLinks.leaderboard')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <SeasonHero completedChallengeIds={completedChallenges} />
            <View style={styles.xpSection}>
              <XPBar totalXP={totalXP} />
            </View>
            <Text style={styles.sectionLabel}>{t('title')}</Text>
          </>
        }
        renderItem={({ item }) => {
          const status = getStatus(item.id, completedChallenges, completedTasks);
          const done = completedTasks.filter((k) => k.startsWith(item.id + ':')).length;
          return (
            <ChallengeCard
              challenge={item}
              status={status}
              completedTasks={done}
              onPress={() => router.push(`/challenges/${item.id}`)}
            />
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
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  screenTitle: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize['2xl'],
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  linkBtn: {
    backgroundColor: Colors.accent2 + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  linkText: {
    fontFamily: FontFamily.condensedMedium,
    fontSize: FontSize.sm,
    color: Colors.accent2,
  },
  xpSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    marginHorizontal: 16,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
});
