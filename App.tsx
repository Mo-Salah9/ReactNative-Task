import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FadeInView } from './src/components/FadeInView';
import { DECKS, findDeck } from './src/data/decks';
import { useBestScores } from './src/hooks/useBestScores';
import { DeckListScreen } from './src/screens/DeckListScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { useTheme } from './src/theme/useTheme';
import type { Deck, SessionResult } from './src/types';

type Route =
  | { name: 'decks' }
  | { name: 'study'; deck: Deck; cardIds: string[] | null; sessionId: number }
  | { name: 'results'; deck: Deck; result: SessionResult; isReview: boolean; isNewBest: boolean };

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigator />
    </SafeAreaProvider>
  );
}

/** A small state-based navigator: three screens don't need a navigation library. */
function Navigator() {
  const { isDark } = useTheme();
  const { scores, recordScore } = useBestScores();
  const [route, setRoute] = useState<Route>({ name: 'decks' });
  const sessionCounter = useRef(0);

  const goToDecks = useCallback(() => setRoute({ name: 'decks' }), []);

  const startStudy = useCallback((deck: Deck, cardIds: string[] | null = null) => {
    sessionCounter.current += 1;
    setRoute({ name: 'study', deck, cardIds, sessionId: sessionCounter.current });
  }, []);

  const handleFinish = useCallback(
    (result: SessionResult, isReview: boolean) => {
      const deck = findDeck(result.deckId);
      if (!deck) {
        setRoute({ name: 'decks' });
        return;
      }
      // Only full-deck sessions count toward the best score; a review of
      // missed cards uses a smaller, easier set.
      const total = result.known.length + result.unknown.length;
      const isNewBest =
        !isReview && recordScore(deck.id, { known: result.known.length, total, achievedAt: result.finishedAt });
      setRoute({ name: 'results', deck, result, isReview, isNewBest });
    },
    [recordScore],
  );

  const renderScreen = () => {
    switch (route.name) {
      case 'decks':
        return <DeckListScreen decks={DECKS} bestScores={scores} onSelectDeck={(deck) => startStudy(deck)} />;
      case 'study':
        return (
          <StudyScreen deck={route.deck} cardIds={route.cardIds} onFinish={handleFinish} onExit={goToDecks} />
        );
      case 'results':
        return (
          <ResultsScreen
            deck={route.deck}
            result={route.result}
            isReview={route.isReview}
            isNewBest={route.isNewBest}
            onReviewMissed={(cardIds) => startStudy(route.deck, cardIds)}
            onRestart={() => startStudy(route.deck)}
            onBackToDecks={goToDecks}
          />
        );
    }
  };

  const screenKey = route.name === 'study' ? `study-${route.sessionId}` : route.name;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <FadeInView key={screenKey}>{renderScreen()}</FadeInView>
    </>
  );
}
