import type { Deck } from '../types';
import rawDecks from './decks.json';

export const DECKS: Deck[] = rawDecks;

export function findDeck(deckId: string): Deck | undefined {
  return DECKS.find((deck) => deck.id === deckId);
}
