import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import { CHALLENGES } from '../../constants/challenges';
import { useProgressStore } from '../../store/progressStore';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';

export default function ChallengeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('challenges');
  const router = useRouter();
  const { user } = useAuthStore();
  const { completedTasks, completedChallenges, completeTask, onDistanceUpdated } = useProgressStore();
  const { distanceKm, setDistanceKm } = useTripStore();

  const [distanceInput, setDistanceInput] = useState(distanceKm > 0 ? String(distanceKm) : '');

  const challenge = CHALLENGES.find((c) => c.id === id);
  if (!challenge) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Challenge not found</Text>
      </SafeAreaView>
    );
  }

  const isComplete = completedChallenges.includes(challenge.id);
  const userId = user?.uid ?? null;
  const displayName = user?.displayName ?? user?.email ?? 'Kullanıcı';
  const allTasksDone = challenge.tasks.every((t) =>
    completedTasks.includes(`${challenge.id}:${t.id}`),
  );

  function handleMarkDone(taskId: string) {
    completeTask(challenge!.id, taskId, userId, displayName);
  }

  function handleDistanceUpdate() {
    const km = parseFloat(distanceInput);
    if (isNaN(km) || km < 0) return;
    setDistanceKm(km);
    onDistanceUpdated(km, userId, displayName);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.ink} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.emoji}>{challenge.emoji}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{challenge.name}</Text>
          <Text style={styles.headerDesc}>{challenge.description}</Text>
        </View>
      </View>

      {isComplete && (
        <View style={styles.rewardBanner}>
          <Text style={styles.rewardText}>🏅 {t('allTasksDone')}</Text>
          <Text style={styles.rewardXP}>{t('xpReward', { xp: challenge.xpReward })}</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>{t('tasks')}</Text>

        {challenge.tasks.map((task) => {
          const taskKey = `${challenge.id}:${task.id}`;
          const done = completedTasks.includes(taskKey);
          const isDistance = challenge.type === 'distance' && task.autoDetect;

          return (
            <View key={task.id} style={[styles.taskCard, done && styles.taskDone]}>
              <View style={styles.taskLeft}>
                <Text style={[styles.taskCheck, done ? styles.checkDone : styles.checkPending]}>
                  {done ? '✓' : '○'}
                </Text>
                <View style={styles.taskBody}>
                  <Text style={[styles.taskDesc, done && styles.taskDescDone]}>
                    {task.description}
                  </Text>
                  {task.autoDetect && (
                    <View style={styles.autoPill}>
                      <Text style={styles.autoText}>{t('autoDetect')}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.taskRight}>
                <Text style={styles.taskXP}>{t('xpReward', { xp: task.xp })}</Text>
                {!done && !task.autoDetect && (
                  <TouchableOpacity
                    style={styles.markBtn}
                    onPress={() => handleMarkDone(task.id)}
                  >
                    <Text style={styles.markBtnText}>{t('markDone')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {challenge.type === 'distance' && (
          <View style={styles.distanceSection}>
            <Text style={styles.sectionLabel}>{t('distance.update')}</Text>
            <Text style={styles.distanceToday}>{t('distance.today', { km: distanceKm })}</Text>
            <View style={styles.distanceRow}>
              <TextInput
                style={styles.distanceInput}
                value={distanceInput}
                onChangeText={setDistanceInput}
                placeholder={t('distance.placeholder')}
                placeholderTextColor={Colors.muted}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.distanceBtn} onPress={handleDistanceUpdate}>
                <Text style={styles.distanceBtnText}>{t('distance.update')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {challenge.unlockCondition && (
          <View style={styles.unlockSection}>
            <Text style={styles.unlockLabel}>{t('unlockCondition')}</Text>
            <Text style={styles.unlockValue}>{challenge.unlockCondition}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  backBtn: {
    paddingRight: 8,
  },
  backIcon: {
    fontSize: 28,
    color: '#FDFAF4',
    lineHeight: 28,
  },
  emoji: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.xl,
    color: '#FDFAF4',
  },
  headerDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#C8BBAA',
    lineHeight: 18,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accent3 + '22',
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent3 + '44',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rewardText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.accent3,
  },
  rewardXP: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.gold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  sectionLabel: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  taskDone: {
    opacity: 0.7,
    borderColor: Colors.accent3 + '66',
    backgroundColor: Colors.accent3 + '0A',
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  taskCheck: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.lg,
    marginTop: 1,
  },
  checkDone: {
    color: Colors.accent3,
  },
  checkPending: {
    color: Colors.muted,
  },
  taskBody: {
    flex: 1,
    gap: 4,
  },
  taskDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.ink,
    lineHeight: 20,
  },
  taskDescDone: {
    textDecorationLine: 'line-through',
    color: Colors.muted,
  },
  autoPill: {
    backgroundColor: Colors.accent2 + '22',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  autoText: {
    fontFamily: FontFamily.condensedMedium,
    fontSize: FontSize.xs,
    color: Colors.accent2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  taskXP: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
  markBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  markBtnText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
  notFound: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 60,
  },
  distanceSection: {
    marginTop: 8,
    gap: 8,
  },
  distanceToday: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  distanceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  distanceInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  distanceBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  distanceBtnText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
  unlockSection: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  unlockLabel: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.warn,
  },
  unlockValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.muted,
    flex: 1,
  },
});
