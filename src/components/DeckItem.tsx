import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

type DeckItemProps = {
  title: string;
  cardCountLabel: string;
  bestScoreLabel: string;
  accent: string;
  onPress: () => void;
};

export function DeckItem({ title, cardCountLabel, bestScoreLabel, accent, onPress }: DeckItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${cardCountLabel}, best score ${bestScoreLabel}`}
      accessibilityHint="Opens a study session"
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.badge, { backgroundColor: accent }]}>
        <Text style={styles.badgeText}>{title.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{cardCountLabel}</Text>
      </View>
      <View style={styles.best}>
        <Text style={[styles.bestLabel, { color: colors.textMuted }]}>Best</Text>
        <Text style={[styles.bestValue, { color: colors.text }]}>{bestScoreLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  best: {
    alignItems: 'flex-end',
  },
  bestLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bestValue: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
