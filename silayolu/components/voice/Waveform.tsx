import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

const BAR_COUNT = 9;
const BAR_MIN_H = 4;
const BAR_MAX_H = 48;

// Different animation params per bar for organic feel
const BAR_PARAMS = [
  { duration: 340, maxH: 18 },
  { duration: 280, maxH: 36 },
  { duration: 420, maxH: 28 },
  { duration: 310, maxH: 48 },
  { duration: 260, maxH: 44 },
  { duration: 390, maxH: 48 },
  { duration: 300, maxH: 30 },
  { duration: 350, maxH: 38 },
  { duration: 270, maxH: 20 },
];

interface Props {
  active: boolean;
  color?: string;
}

export function Waveform({ active, color = Colors.accent }: Props) {
  const animations = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(BAR_MIN_H)),
  ).current;

  const loopsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    // Stop all previous
    loopsRef.current.forEach((a) => a.stop());
    loopsRef.current = [];

    if (active) {
      animations.forEach((anim, i) => {
        const { duration, maxH } = BAR_PARAMS[i];
        // Stagger start so bars don't all peak simultaneously
        const loop = Animated.loop(
          Animated.sequence([
            Animated.delay(i * 35),
            Animated.timing(anim, {
              toValue: maxH,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: BAR_MIN_H,
              duration,
              useNativeDriver: false,
            }),
          ]),
        );
        loopsRef.current.push(loop);
        loop.start();
      });
    } else {
      // Collapse all bars to minimum
      animations.forEach((anim) => {
        Animated.timing(anim, {
          toValue: BAR_MIN_H,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }

    return () => {
      loopsRef.current.forEach((a) => a.stop());
    };
  }, [active]);

  return (
    <View style={styles.container}>
      {animations.map((height, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height,
              backgroundColor: active ? color : Colors.border,
              opacity: active ? 1 : 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: BAR_MAX_H + 8,
  },
  bar: {
    width: 5,
    borderRadius: 3,
    minHeight: BAR_MIN_H,
  },
});
