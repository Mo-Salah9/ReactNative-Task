import { useEffect, useState, type ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';

type FadeInViewProps = {
  children: ReactNode;
};

/** Fades and slides its content in on mount; used for screen transitions. */
export function FadeInView({ children }: FadeInViewProps) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View style={[styles.container, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
