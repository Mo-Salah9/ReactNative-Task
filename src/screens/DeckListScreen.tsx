import { FlatList, StyleSheet, Text, View } from 'react-native';
import { DeckItem } from '../components/DeckItem';
import { Screen } from '../components/Screen';
import { useTheme } from '../theme/useTheme';
import type { BestScores, Deck } from '../types';
import { formatBestScore, formatCardCount } from '../utils/score';

type DeckListScreenProps = {
  decks: Deck[];
  bestScores: BestScores;
  onSelectDeck: (deck: Deck) => void;
};

export function DeckListScreen({ decks, bestScores, onSelectDeck }: DeckListScreenProps) {
  const { colors } = useTheme();

  return (
    <Screen>
      <FlatList
        data={decks}
        keyExtractor={(deck) => deck.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Flashcards</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Pick a deck. Tap a card to flip it, swipe right if you knew it.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <DeckItem
            title={item.title}
            accent={item.accent}
            cardCountLabel={formatCardCount(item.cards.length)}
            bestScoreLabel={formatBestScore(bestScores[item.id])}
            onPress={() => onSelectDeck(item)}
          />
        )}
      />
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  separator: {
    height: 12,
  },
});
