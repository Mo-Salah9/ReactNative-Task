import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useCardFlip } from '../hooks/useCardFlip';
import { useTheme } from '../theme/useTheme';

type FlashCardProps = {
  front: string;
  back: string;
  rtl?: boolean;
  disabled?: boolean; // e.g. the preview card under the active one
  onFlip?: () => void;
};

export function FlashCard({ front, back, rtl = false, disabled = false, onFlip }: FlashCardProps) {
  const { colors } = useTheme();
  const { isFlipped, toggle, frontStyle, backStyle } = useCardFlip();
  const textDirection = rtl ? styles.rtl : null;

  const handlePress = () => {
    toggle();
    onFlip?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={isFlipped ? `Answer: ${back}` : `Question: ${front}`}
      accessibilityHint="Double tap to flip the card"
    >
      <Animated.View
        style={[styles.face, { backgroundColor: colors.surface, borderColor: colors.border }, frontStyle]}
      >
        <Text style={[styles.caption, { color: colors.textMuted }]}>Question</Text>
        <Text style={[styles.text, { color: colors.text }, textDirection]}>{front}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Tap to flip</Text>
      </Animated.View>
      <Animated.View
        style={[styles.face, { backgroundColor: colors.cardBack, borderColor: colors.border }, backStyle]}
      >
        <Text style={[styles.caption, { color: colors.primary }]}>Answer</Text>
        <Text style={[styles.text, { color: colors.text }, textDirection]}>{back}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Swipe right if you knew it</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  face: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
  },
  caption: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
  },
  rtl: {
    writingDirection: 'rtl',
    fontSize: 30,
    lineHeight: 44,
  },
  hint: {
    fontSize: 13,
  },
});
