import type { Card } from '../types';
import { shuffle } from './shuffle';

export type SessionState = {
  cards: Card[]; // shuffled order for this session
  index: number; // index of the current card
  known: string[];
  unknown: string[];
  finishedAt: number | null;
};

export type SessionAction =
  | { type: 'answer'; cardId: string; knewIt: boolean; at: number }
  | { type: 'restart'; cards: Card[] };

export function createSession(cards: readonly Card[], random: () => number = Math.random): SessionState {
  return {
    cards: shuffle(cards, random),
    index: 0,
    known: [],
    unknown: [],
    finishedAt: null,
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'answer': {
      // Ignore answers for a card that is no longer current. This protects
      // against fast repeated swipes/taps sending the same answer twice.
      const current = state.cards[state.index];
      if (state.finishedAt !== null || current?.id !== action.cardId) {
        return state;
      }
      const nextIndex = state.index + 1;
      return {
        ...state,
        index: nextIndex,
        known: action.knewIt ? [...state.known, current.id] : state.known,
        unknown: action.knewIt ? state.unknown : [...state.unknown, current.id],
        finishedAt: nextIndex >= state.cards.length ? action.at : null,
      };
    }
    case 'restart':
      return createSession(action.cards);
  }
}

/** Keeps only the cards whose ids are listed, or all cards when `cardIds` is null. */
export function selectCards(cards: readonly Card[], cardIds: readonly string[] | null): Card[] {
  if (cardIds === null) {
    return [...cards];
  }
  const wanted = new Set(cardIds);
  return cards.filter((card) => wanted.has(card.id));
}
