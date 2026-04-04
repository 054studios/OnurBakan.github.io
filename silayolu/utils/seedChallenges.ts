import firestore from '@react-native-firebase/firestore';
import { CHALLENGES } from '../constants/challenges';

let seeded = false;

export async function seedChallengesIfNeeded(): Promise<void> {
  if (seeded) return;
  seeded = true;

  try {
    const snap = await firestore().collection('challenges').limit(1).get();
    if (!snap.empty) return;

    const batch = firestore().batch();
    for (const challenge of CHALLENGES) {
      const ref = firestore().collection('challenges').doc(challenge.id);
      batch.set(ref, {
        ...challenge,
        createdAt: firestore.Timestamp.now(),
      });
    }
    await batch.commit();
  } catch (err) {
    console.warn('[seedChallenges] error:', err);
    seeded = false; // allow retry on next mount
  }
}
