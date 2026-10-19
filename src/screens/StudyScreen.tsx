import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { FlashCard } from '../components/FlashCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { StudyHeader } from '../components/StudyHeader';
import { SwipeableCard, type SwipeableCardHandle } from '../components/SwipeableCard';
import { useBackHandler } from '../hooks/useBackHandler';
import { useStudySession } from '../hooks/useStudySession';
import { useTheme } from '../theme/useTheme';
import type { Deck, SessionResult, SwipeDirection } from '../types';
import { flipFeedback, swipeFeedback } from '../utils/haptics';
import { selectCards } from '../utils/session';

type StudyScreenProps = {
  deck: Deck;
  cardIds: string[] | null; // null = whole deck, otherwise a review of these cards
  onFinish: (result: SessionResult, isReview: boolean) => void;
  onExit: () => void;
};

export function StudyScreen({ deck, cardIds, onFinish, onExit }: StudyScreenProps) {
  const { colors } = useTheme();
  const isReview = cardIds !== null;
  const cards = useMemo(() => selectCards(deck.cards, cardIds), [deck, cardIds]);
  const session = useStudySession(deck.id, cards);
  const cardRef = useRef<SwipeableCardHandle>(null);
  const { result, isEmpty, isFinished, markKnown, markUnknown } = session;

  useEffect(() => {
    if (result) onFinish(result, isReview);
  }, [result, isReview, onFinish]);

  const requestQuit = useCallback(() => {
    if (isEmpty || isFinished) {
      onExit();
      return;
    }
    Alert.alert('Quit session?', "Your answers in this session won't be saved.", [
      { text: 'Keep studying', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: onExit },
    ]);
  }, [isEmpty, isFinished, onExit]);

  useBackHandler(() => {
    requestQuit();
    return true;
  });

  // Swipes and buttons both end up here, so they always record the same result.
  const handleSwiped = useCallback(
    (direction: SwipeDirection) => {
      swipeFeedback(direction);
      if (direction === 'right') markKnown();
      else markUnknown();
    },
    [markKnown, markUnknown],
  );

  if (isEmpty) {
    return (
      <Screen>
        <View style={styles.emptyHeader}>
          <BackButton onPress={onExit} />
        </View>
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No cards in {deck.title}</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            This deck is empty. Pick another deck to start studying.
          </Text>
          <PrimaryButton title="Back to decks" onPress={onExit} style={styles.emptyButton} />
        </View>
      </Screen>
    );
  }

  const title = isReview ? `Review · ${deck.title}` : deck.title;

  return (
    <Screen>
      <StudyHeader
        title={title}
        position={session.position}
        total={session.total}
        knownCount={session.knownCount}
        progress={session.progress}
        onBack={requestQuit}
      />

      <View style={styles.cardArea}>
        <View style={styles.cardStack}>
          {session.nextCard && (
            <View style={[StyleSheet.absoluteFill, styles.nextCard]}>
              <FlashCard
                key={session.nextCard.id}
                front={session.nextCard.front}
                back={session.nextCard.back}
                rtl={deck.rtl}
                disabled
              />
            </View>
          )}
          {session.currentCard && (
            <SwipeableCard key={session.currentCard.id} ref={cardRef} onSwiped={handleSwiped}>
              <FlashCard
                front={session.currentCard.front}
                back={session.currentCard.back}
                rtl={deck.rtl}
                onFlip={flipFeedback}
              />
            </SwipeableCard>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="Don't know"
          variant="danger"
          onPress={() => cardRef.current?.swipe('left')}
          accessibilityHint="Marks this card as not known"
          style={styles.action}
        />
        <PrimaryButton
          title="Know"
          variant="success"
          onPress={() => cardRef.current?.swipe('right')}
          accessibilityHint="Marks this card as known"
          style={styles.action}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStack: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    maxHeight: 540,
  },
  nextCard: {
    transform: [{ scale: 0.94 }, { translateY: 14 }],
    opacity: 0.7,
    pointerEvents: 'none',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  action: {
    flex: 1,
  },
  emptyHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 12,
    alignSelf: 'stretch',
  },
});
