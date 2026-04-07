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
      style={[{ width: width as number, height, borderRadius: 4, backgroundColor: Colors.border }, style]}
    />
  );
}

function SkeletonRowInner({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View style={[styles.row, { opacity }]}>
      {/* Avatar circle */}
      <View style={styles.avatar} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Bone width={130} height={14} />
          <Bone width={40} height={11} />
        </View>
        <Bone width="80%" height={11} style={{ marginTop: 6 }} />
      </View>
    </Animated.View>
  );
}

export function SkeletonGroupRow() {
  const opacity = usePulse();
  return <SkeletonRowInner opacity={opacity} />;
}

export function SkeletonGroupList({ count = 4 }: { count?: number }) {
  const opacity = usePulse();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRowInner key={i} opacity={opacity} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
