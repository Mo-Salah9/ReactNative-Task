import { useImperativeHandle, type ReactNode, type Ref } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useTheme } from '../theme/useTheme';
import type { SwipeDirection } from '../types';

export type SwipeableCardHandle = {
  swipe: (direction: SwipeDirection) => void;
};

type SwipeableCardProps = {
  children: ReactNode;
  onSwiped: (direction: SwipeDirection) => void;
  ref?: Ref<SwipeableCardHandle>;
};

/** Wraps a card with drag-to-swipe. The parent can also trigger a swipe through the ref. */
export function SwipeableCard({ children, onSwiped, ref }: SwipeableCardProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { panHandlers, swipe, cardStyle, knowLabelStyle, unknownLabelStyle } = useSwipeGesture({
    width,
    onSwiped,
  });

  useImperativeHandle(ref, () => ({ swipe: (direction) => swipe(direction) }), [swipe]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, cardStyle]} {...panHandlers}>
      {children}
      <Animated.View
        style={[styles.label, styles.knowLabel, { borderColor: colors.success }, knowLabelStyle]}
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={[styles.labelText, { color: colors.success }]}>Know</Text>
      </Animated.View>
      <Animated.View
        style={[styles.label, styles.unknownLabel, { borderColor: colors.danger }, unknownLabelStyle]}
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={[styles.labelText, { color: colors.danger }]}>Don&apos;t know</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    top: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderRadius: 10,
    pointerEvents: 'none',
  },
  knowLabel: {
    left: 24,
    transform: [{ rotate: '-12deg' }],
  },
  unknownLabel: {
    right: 24,
    transform: [{ rotate: '12deg' }],
  },
  labelText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
