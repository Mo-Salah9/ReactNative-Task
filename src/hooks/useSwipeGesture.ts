import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Easing, PanResponder } from 'react-native';
import type { SwipeDirection } from '../types';

const DISTANCE_THRESHOLD = 0.3; // share of screen width
const FLICK_MIN_DISTANCE = 0.1; // share of screen width
const FLICK_VELOCITY = 0.6; // px per ms
const MAX_ROTATION_DEG = 12;
const VERTICAL_FOLLOW = 0.25; // how much the card follows vertical movement

/** Decides whether a released drag counts as a swipe, and in which direction. */
export function resolveSwipe(dx: number, vx: number, width: number): SwipeDirection | null {
  const direction: SwipeDirection = dx > 0 ? 'right' : 'left';
  if (Math.abs(dx) >= width * DISTANCE_THRESHOLD) return direction;
  const isFlick = Math.abs(vx) >= FLICK_VELOCITY && Math.sign(vx) === Math.sign(dx);
  if (isFlick && Math.abs(dx) >= width * FLICK_MIN_DISTANCE) return direction;
  return null;
}

type Options = {
  width: number;
  onSwiped: (direction: SwipeDirection) => void;
};

export function useSwipeGesture({ width, onSwiped }: Options) {
  const [position] = useState(() => new Animated.ValueXY());
  const onSwipedRef = useRef(onSwiped);
  const widthRef = useRef(width);
  const isLeavingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    onSwipedRef.current = onSwiped;
    widthRef.current = width;
  }, [onSwiped, width]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      position.stopAnimation();
    };
  }, [position]);

  const springBack = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [position]);

  /** Flies the card off screen, then reports the swipe. Safe to call repeatedly. */
  const swipe = useCallback(
    (direction: SwipeDirection, dy = 0) => {
      if (isLeavingRef.current) return;
      isLeavingRef.current = true;
      const x = (direction === 'right' ? 1 : -1) * widthRef.current * 1.5;
      Animated.timing(position, {
        toValue: { x, y: dy },
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        if (isMountedRef.current) onSwipedRef.current(direction);
      });
    },
    [position],
  );

  const panResponder = useMemo(() => {
    const shouldCapture = (dx: number, dy: number) =>
      !isLeavingRef.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy);

    // The handlers below only run on touch events, never during render, so
    // reading refs inside them is safe. The lint rule can't see that.
    // eslint-disable-next-line react-hooks/refs
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => shouldCapture(g.dx, g.dy),
      onMoveShouldSetPanResponderCapture: (_, g) => shouldCapture(g.dx, g.dy),
      onPanResponderGrant: () => position.stopAnimation(),
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy * VERTICAL_FOLLOW }),
      onPanResponderRelease: (_, g) => {
        const direction = resolveSwipe(g.dx, g.vx, widthRef.current);
        if (direction) swipe(direction, g.dy * VERTICAL_FOLLOW);
        else springBack();
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: springBack,
    });
  }, [position, springBack, swipe]);

  // If the app goes to the background mid-drag, put the card back in place.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && !isLeavingRef.current) springBack();
    });
    return () => subscription.remove();
  }, [springBack]);

  const animatedStyles = useMemo(() => {
    const threshold = width * DISTANCE_THRESHOLD;
    const rotate = position.x.interpolate({
      inputRange: [-width, 0, width],
      outputRange: [`-${MAX_ROTATION_DEG}deg`, '0deg', `${MAX_ROTATION_DEG}deg`],
    });
    return {
      cardStyle: { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
      knowLabelStyle: {
        opacity: position.x.interpolate({ inputRange: [0, threshold], outputRange: [0, 1], extrapolate: 'clamp' }),
      },
      unknownLabelStyle: {
        opacity: position.x.interpolate({ inputRange: [-threshold, 0], outputRange: [1, 0], extrapolate: 'clamp' }),
      },
    };
  }, [position, width]);

  return { panHandlers: panResponder.panHandlers, swipe, ...animatedStyles };
}
