import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Drives a 3D flip. Both faces rotate around the Y axis; each face is also
 * hidden (opacity 0) once it passes 90°, so the back text is never shown
 * mirrored, even on platforms where backfaceVisibility is unreliable.
 */
export function useCardFlip() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: isFlipped ? 1 : 0,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [isFlipped, progress]);

  const toggle = useCallback(() => setIsFlipped((flipped) => !flipped), []);

  const { frontStyle, backStyle } = useMemo(() => {
    const frontRotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
    const backRotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
    const frontOpacity = progress.interpolate({
      inputRange: [0, 0.499, 0.501, 1],
      outputRange: [1, 1, 0, 0],
      extrapolate: 'clamp',
    });
    const backOpacity = progress.interpolate({
      inputRange: [0, 0.499, 0.501, 1],
      outputRange: [0, 0, 1, 1],
      extrapolate: 'clamp',
    });
    return {
      frontStyle: { opacity: frontOpacity, transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
      backStyle: { opacity: backOpacity, transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
    };
  }, [progress]);

  return { isFlipped, toggle, frontStyle, backStyle };
}
