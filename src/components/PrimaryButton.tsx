import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type Palette } from '../theme/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

function getButtonColors(variant: ButtonVariant, colors: Palette) {
  switch (variant) {
    case 'primary':
      return { background: colors.primary, text: colors.onPrimary, border: colors.primary };
    case 'success':
      return { background: colors.success, text: colors.onPrimary, border: colors.success };
    case 'danger':
      return { background: colors.danger, text: colors.onPrimary, border: colors.danger };
    case 'secondary':
      return { background: colors.surface, text: colors.text, border: colors.border };
  }
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
  style,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const palette = getButtonColors(variant, colors);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
