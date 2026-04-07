import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

function usePulse() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return opacity;
}

function Bone({ width, height, style }: { width: number | string; height: number; style?: object }) {
  return (
    <View
      style={[
        { width: width as number, height, borderRadius: 4, backgroundColor: Colors.border },
        style,
      ]}
    />
  );
}

function SkeletonCardInner({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.strip} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          {/* Flags placeholder */}
          <Bone width={64} height={24} />
          {/* Name placeholder */}
          <Bone width={100} height={16} style={styles.nameGap} />
          {/* Badge placeholder */}
          <Bone width={52} height={32} />
        </View>
        <View style={styles.bottomRow}>
          <Bone width={80} height={11} />
          <Bone width={110} height={11} />
        </View>
      </View>
    </Animated.View>
  );
}

export function SkeletonCard() {
  const opacity = usePulse();
  return <SkeletonCardInner opacity={opacity} />;
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  const opacity = usePulse();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardInner key={i} opacity={opacity} />
      ))}
    </>
  );
}

// Route progress skeleton
export function SkeletonProgress() {
  const opacity = usePulse();
  return (
    <Animated.View style={[styles.progressCard, { opacity }]}>
      <Bone width={120} height={12} />
      <View style={{ height: 12 }} />
      {Array.from({ length: 7 }).map((_, i) => (
        <View key={i} style={styles.progressRow}>
          <Bone width={20} height={20} style={{ borderRadius: 10 }} />
          <Bone width={90 + (i % 3) * 20} height={12} />
        </View>
      ))}
    </Animated.View>
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
    backgroundColor: Colors.border,
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameGap: { flex: 1 },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },

  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
});
