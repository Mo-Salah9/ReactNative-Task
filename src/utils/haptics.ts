import * as Haptics from 'expo-haptics';
import type { SwipeDirection } from '../types';

export function swipeFeedback(direction: SwipeDirection): void {
  const type =
    direction === 'right' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning;
  // Haptics are a nice-to-have; ignore devices that don't support them.
  Haptics.notificationAsync(type).catch(() => undefined);
}

export function flipFeedback(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}
