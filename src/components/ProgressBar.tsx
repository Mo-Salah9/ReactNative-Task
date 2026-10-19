import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

type ProgressBarProps = {
  progress: number; // 0..1
  color?: string;
};

export function ProgressBar({ progress, color }: ProgressBarProps) {
  const { colors } = useTheme();
  const [animated] = useState(() => new Animated.Value(progress));

  useEffect(() => {
    const animation = Animated.timing(animated, {
      toValue: progress,
      duration: 250,
      useNativeDriver: false, // width can't use the native driver
    });
    animation.start();
    return () => animation.stop();
  }, [animated, progress]);

  const width = animated.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, { backgroundColor: colors.surfaceMuted }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
    >
      <Animated.View style={[styles.fill, { width, backgroundColor: color ?? colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
