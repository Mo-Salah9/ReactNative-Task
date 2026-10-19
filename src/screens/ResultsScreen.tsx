import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useBackHandler } from '../hooks/useBackHandler';
import { useTheme } from '../theme/useTheme';
import type { Deck, SessionResult } from '../types';
import { summarizeResult } from '../utils/score';
import { selectCards } from '../utils/session';

type ResultsScreenProps = {
  deck: Deck;
  result: SessionResult;
  isReview: boolean;
  isNewBest: boolean;
  onReviewMissed: (cardIds: string[]) => void;
  onRestart: () => void;
  onBackToDecks: () => void;
};

export function ResultsScreen({
  deck,
  result,
  isReview,
  isNewBest,
  onReviewMissed,
  onRestart,
  onBackToDecks,
}: ResultsScreenProps) {
  const { colors } = useTheme();
  const summary = useMemo(() => summarizeResult(result), [result]);
  const missedCards = useMemo(() => selectCards(deck.cards, result.unknown), [deck, result]);
  const hasMissed = missedCards.length > 0;

  useBackHandler(() => {
    onBackToDecks();
    return true;
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.deckTitle, { color: colors.textMuted }]}>
          {isReview ? `Review · ${deck.title}` : deck.title}
        </Text>

        <View style={[styles.scoreCircle, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
          <Text style={[styles.percent, { color: colors.text }]}>{summary.percent}%</Text>
          <Text style={[styles.fraction, { color: colors.textMuted }]}>
            {summary.known} / {summary.total} known
          </Text>
        </View>

        <Text style={[styles.message, { color: colors.text }]}>{summary.message}</Text>
        {isNewBest && (
          <View style={[styles.badge, { backgroundColor: colors.success }]}>
            <Text style={styles.badgeText}>New best score!</Text>
          </View>
        )}

        {hasMissed && (
          <View style={[styles.missed, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.missedTitle, { color: colors.text }]}>Missed cards</Text>
            {missedCards.map((card) => (
              <View key={card.id} style={[styles.missedRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.missedFront, { color: colors.text }]}>{card.front}</Text>
                <Text style={[styles.missedBack, { color: colors.textMuted }]}>{card.back}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        {hasMissed && (
          <PrimaryButton
            title={`Review missed (${missedCards.length})`}
            onPress={() => onReviewMissed(result.unknown)}
          />
        )}
        <PrimaryButton title="Restart deck" variant={hasMissed ? 'secondary' : 'primary'} onPress={onRestart} />
        <PrimaryButton title="Back to decks" variant="secondary" onPress={onBackToDecks} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  deckTitle: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreCircle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  fraction: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  message: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  missed: {
    alignSelf: 'stretch',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  missedTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  missedRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    gap: 2,
  },
  missedFront: {
    fontSize: 15,
    fontWeight: '600',
  },
  missedBack: {
    fontSize: 14,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
});
