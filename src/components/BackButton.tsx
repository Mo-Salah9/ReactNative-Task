import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/useTheme';

type BackButtonProps = {
  onPress: () => void;
  label?: string;
};

export function BackButton({ onPress, label = 'Back' }: BackButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, { backgroundColor: colors.surfaceMuted }, pressed && styles.pressed]}
    >
      <Text style={[styles.icon, { color: colors.text }]}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '600',
    marginTop: -2,
  },
});
