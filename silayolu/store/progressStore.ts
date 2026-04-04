import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';
import { CHALLENGES, BADGES, SEASON } from '../constants/challenges';

// ─── State shape ──────────────────────────────────────────────────────────────

interface ProgressState {
  completedTasks: string[];       // "challengeId:taskId"
  completedChallenges: string[];  // challengeId
  earnedBadges: string[];         // badgeId
  totalXP: number;
  borderReportCount: number;
  /** True while initial Firestore load is running */
  isLoading: boolean;

  // ─ Actions ──────────────────────────────────────────────────────────────
  loadProgress: (userId: string, displayName: string) => Promise<void>;
  completeTask: (challengeId: string, taskId: string, userId: string | null, displayName: string) => void;
  onBorderReportSubmitted: (userId: string | null, displayName: string) => void;
  onDistanceUpdated: (km: number, userId: string | null, displayName: string) => void;
  reset: () => void;
}

// ─── Firestore helpers ────────────────────────────────────────────────────────

function progressRef(userId: string) {
  return firestore().collection('userProgress').doc(userId);
}

function persistProgress(
  userId: string,
  displayName: string,
  patch: Partial<{
    completedTasks: string[];
    completedChallenges: string[];
    earnedBadges: string[];
    totalXP: number;
    borderReportCount: number;
  }>,
) {
  if (!userId) return;
  progressRef(userId)
    .set({ displayName, updatedAt: firestore.Timestamp.now(), ...patch }, { merge: true })
    .catch((err) => console.warn('[progressStore] Firestore write error:', err));
}

// ─── Internal logic helpers ───────────────────────────────────────────────────

interface Mutation {
  newCompletedTasks: string[];
  newCompletedChallenges: string[];
  newEarnedBadges: string[];
  addedXP: number;
}

function applyTaskCompletion(
  taskKey: string,
  challengeId: string,
  current: Pick<ProgressState, 'completedTasks' | 'completedChallenges' | 'earnedBadges' | 'totalXP'>,
): Mutation {
  const mut: Mutation = {
    newCompletedTasks: [...current.completedTasks],
    newCompletedChallenges: [...current.completedChallenges],
    newEarnedBadges: [...current.earnedBadges],
    addedXP: 0,
  };

  if (mut.newCompletedTasks.includes(taskKey)) return mut; // already done

  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) return mut;

  const task = challenge.tasks.find((t) => `${challengeId}:${t.id}` === taskKey);
  if (!task) return mut;

  mut.newCompletedTasks.push(taskKey);
  mut.addedXP += task.xp;

  // First-ever task → first-steps badge
  if (current.completedTasks.length === 0 && !mut.newEarnedBadges.includes('first-steps')) {
    mut.newEarnedBadges.push('first-steps');
  }

  // Check if all tasks in this challenge are now done
  const allTasksDone = challenge.tasks.every((t) =>
    mut.newCompletedTasks.includes(`${challengeId}:${t.id}`),
  );

  if (allTasksDone && !mut.newCompletedChallenges.includes(challengeId)) {
    mut.newCompletedChallenges.push(challengeId);
    mut.addedXP += challenge.xpReward;

    // Award per-challenge badge
    const badge = BADGES.find((b) => b.awardedBy === challengeId);
    if (badge && !mut.newEarnedBadges.includes(badge.id)) {
      mut.newEarnedBadges.push(badge.id);
    }

    // Check season completion
    const seasonDone = SEASON.requiredChallengeIds.every((id) =>
      mut.newCompletedChallenges.includes(id),
    );
    if (seasonDone && !mut.newEarnedBadges.includes(SEASON.badgeId)) {
      mut.newEarnedBadges.push(SEASON.badgeId);
      mut.addedXP += SEASON.xpBonus;
    }
  }

  return mut;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedTasks: [],
  completedChallenges: [],
  earnedBadges: [],
  totalXP: 0,
  borderReportCount: 0,
  isLoading: false,

  loadProgress: async (userId, displayName) => {
    set({ isLoading: true });
    try {
      const snap = await progressRef(userId).get();
      if (snap.exists()) {
        const d = snap.data()!;
        set({
          completedTasks: d.completedTasks ?? [],
          completedChallenges: d.completedChallenges ?? [],
          earnedBadges: d.earnedBadges ?? [],
          totalXP: d.totalXP ?? 0,
          borderReportCount: d.borderReportCount ?? 0,
        });
      } else {
        // First time user — seed empty doc
        persistProgress(userId, displayName, {
          completedTasks: [],
          completedChallenges: [],
          earnedBadges: [],
          totalXP: 0,
          borderReportCount: 0,
        });
      }
    } catch (err) {
      console.warn('[progressStore] load error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  completeTask: (challengeId, taskId, userId, displayName) => {
    const taskKey = `${challengeId}:${taskId}`;
    const state = get();
    const mut = applyTaskCompletion(taskKey, challengeId, state);

    set({
      completedTasks: mut.newCompletedTasks,
      completedChallenges: mut.newCompletedChallenges,
      earnedBadges: mut.newEarnedBadges,
      totalXP: state.totalXP + mut.addedXP,
    });

    if (userId) {
      persistProgress(userId, displayName, {
        completedTasks: mut.newCompletedTasks,
        completedChallenges: mut.newCompletedChallenges,
        earnedBadges: mut.newEarnedBadges,
        totalXP: state.totalXP + mut.addedXP,
      });
    }
  },

  onBorderReportSubmitted: (userId, displayName) => {
    const state = get();
    const newCount = state.borderReportCount + 1;

    // Auto-complete report-N tasks for 'border-observer'
    const taskIds = ['report-1', 'report-2', 'report-3', 'report-4', 'report-5'];
    const taskToComplete = newCount <= 5 ? taskIds[newCount - 1] : null;

    let updatedState: Pick<ProgressState, 'completedTasks' | 'completedChallenges' | 'earnedBadges' | 'totalXP'> = {
      completedTasks: state.completedTasks,
      completedChallenges: state.completedChallenges,
      earnedBadges: state.earnedBadges,
      totalXP: state.totalXP,
    };

    if (taskToComplete) {
      const taskKey = `border-observer:${taskToComplete}`;
      const mut = applyTaskCompletion(taskKey, 'border-observer', updatedState);
      updatedState = {
        completedTasks: mut.newCompletedTasks,
        completedChallenges: mut.newCompletedChallenges,
        earnedBadges: mut.newEarnedBadges,
        totalXP: updatedState.totalXP + mut.addedXP,
      };
    }

    set({ ...updatedState, borderReportCount: newCount });

    if (userId) {
      persistProgress(userId, displayName, { ...updatedState, borderReportCount: newCount });
    }
  },

  onDistanceUpdated: (km, userId, displayName) => {
    const state = get();

    // Check km-500 and km-1000 milestones
    const milestones: [string, number][] = [['km-500', 500], ['km-1000', 1000]];
    let current = {
      completedTasks: state.completedTasks,
      completedChallenges: state.completedChallenges,
      earnedBadges: state.earnedBadges,
      totalXP: state.totalXP,
    };

    for (const [taskId, threshold] of milestones) {
      if (km >= threshold) {
        const taskKey = `thousand-km-master:${taskId}`;
        const mut = applyTaskCompletion(taskKey, 'thousand-km-master', current);
        current = {
          completedTasks: mut.newCompletedTasks,
          completedChallenges: mut.newCompletedChallenges,
          earnedBadges: mut.newEarnedBadges,
          totalXP: current.totalXP + mut.addedXP,
        };
      }
    }

    set(current);
    if (userId) persistProgress(userId, displayName, current);
  },

  reset: () =>
    set({
      completedTasks: [],
      completedChallenges: [],
      earnedBadges: [],
      totalXP: 0,
      borderReportCount: 0,
      isLoading: false,
    }),
}));
