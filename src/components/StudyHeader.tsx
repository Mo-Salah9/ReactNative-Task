import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { BackButton } from './BackButton';
import { ProgressBar } from './ProgressBar';

type StudyHeaderProps = {
  title: string;
  position: number;
  total: number;
  knownCount: number;
  progress: number;
  onBack: () => void;
};

export function StudyHeader({ title, position, total, knownCount, progress, onBack }: StudyHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <BackButton onPress={onBack} label="Quit session" />
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.counter, { color: colors.textMuted }]}>
            Card {position} / {total}
          </Text>
        </View>
        <View
          style={[styles.score, { backgroundColor: colors.surfaceMuted }]}
          accessible
          accessibilityLabel={`Score: ${knownCount} known`}
        >
          <Text style={[styles.scoreText, { color: colors.success }]}>✓ {knownCount}</Text>
        </View>
      </View>
      <ProgressBar progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  counter: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  score: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
