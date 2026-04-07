import React, { useEffect, useRef } from 'react';
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
      <View style={styles.topRow}>
        <Bone width={72} height={20} />
        <Bone width={56} height={20} />
        <View style={{ flex: 1 }} />
        <Bone width={48} height={12} />
      </View>
      <Bone width="90%" height={16} style={{ marginTop: 4 }} />
      <Bone width="70%" height={16} />
      <Bone width="95%" height={12} style={{ marginTop: 2 }} />
      <Bone width="80%" height={12} />
      <View style={styles.footerRow}>
        <Bone width={28} height={18} />
        <Bone width={28} height={18} />
        <Bone width={28} height={18} />
        <View style={{ flex: 1 }} />
        <Bone width={90} height={12} />
      </View>
    </Animated.View>
  );
}

export function SkeletonNewsCard() {
  const opacity = usePulse();
  return <SkeletonCardInner opacity={opacity} />;
}

export function SkeletonNewsList({ count = 3 }: { count?: number }) {
  const opacity = usePulse();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardInner key={i} opacity={opacity} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.border,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
});
