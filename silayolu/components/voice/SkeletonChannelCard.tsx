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

function SkeletonCardInner({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.top}>
        <Bone width={36} height={36} style={{ borderRadius: 18 }} />
        <View style={styles.info}>
          <Bone width={120} height={14} />
          <Bone width={80} height={11} style={{ marginTop: 6 }} />
        </View>
        <Bone width={36} height={20} style={{ borderRadius: 10 }} />
      </View>
      <View style={styles.bottom}>
        <Bone width="60%" height={11} />
      </View>
    </Animated.View>
  );
}

export function SkeletonChannelCard() {
  const opacity = usePulse();
  return <SkeletonCardInner opacity={opacity} />;
}

export function SkeletonChannelList({ count = 4 }: { count?: number }) {
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
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  bottom: {
    paddingLeft: 48,
  },
});
