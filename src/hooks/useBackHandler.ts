import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

/**
 * Handles the Android hardware back button while the calling screen is mounted.
 * Return true from the handler to stop the default behavior (closing the app).
 */
export function useBackHandler(handler: () => boolean): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => handlerRef.current());
    return () => subscription.remove();
  }, []);
}
