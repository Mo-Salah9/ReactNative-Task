import { useCallback, useMemo, useReducer } from 'react';
import type { Card, SessionResult } from '../types';
import { createSession, sessionReducer } from '../utils/session';

export type StudySession = {
  currentCard: Card | null;
  nextCard: Card | null;
  position: number; // 1-based number of the card on screen
  total: number;
  knownCount: number;
  progress: number; // 0..1, share of cards answered
  isEmpty: boolean;
  isFinished: boolean;
  result: SessionResult | null;
  markKnown: () => void;
  markUnknown: () => void;
  restart: () => void;
};

export function useStudySession(deckId: string, cards: readonly Card[]): StudySession {
  const [state, dispatch] = useReducer(sessionReducer, cards, createSession);

  const total = state.cards.length;
  const currentCard = state.cards[state.index] ?? null;
  const nextCard = state.cards[state.index + 1] ?? null;
  const currentId = currentCard?.id ?? null;

  const answer = useCallback(
    (knewIt: boolean) => {
      if (currentId !== null) {
        dispatch({ type: 'answer', cardId: currentId, knewIt, at: Date.now() });
      }
    },
    [currentId],
  );
  const markKnown = useCallback(() => answer(true), [answer]);
  const markUnknown = useCallback(() => answer(false), [answer]);
  const restart = useCallback(() => dispatch({ type: 'restart', cards: [...cards] }), [cards]);

  const result = useMemo<SessionResult | null>(
    () =>
      state.finishedAt === null
        ? null
        : { deckId, known: state.known, unknown: state.unknown, finishedAt: state.finishedAt },
    [deckId, state.finishedAt, state.known, state.unknown],
  );

  return {
    currentCard,
    nextCard,
    position: Math.min(state.index + 1, total),
    total,
    knownCount: state.known.length,
    progress: total === 0 ? 0 : state.index / total,
    isEmpty: total === 0,
    isFinished: state.finishedAt !== null,
    result,
    markKnown,
    markUnknown,
    restart,
  };
}
