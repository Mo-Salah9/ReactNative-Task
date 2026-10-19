import { useCallback, useEffect, useRef, useState } from 'react';
import { loadBestScores, saveBestScores } from '../storage/bestScores';
import type { BestScore, BestScores } from '../types';
import { isBetterScore } from '../utils/score';

function mergeBestScores(a: BestScores, b: BestScores): BestScores {
  const merged: BestScores = { ...a };
  for (const [deckId, score] of Object.entries(b)) {
    if (isBetterScore(score, merged[deckId])) merged[deckId] = score;
  }
  return merged;
}

/**
 * Best score per deck, loaded from storage once and kept in memory.
 * `recordScore` updates memory right away and persists in the background,
 * so the deck list never shows a stale value after finishing a session.
 */
export function useBestScores() {
  const [scores, setScores] = useState<BestScores>({});
  const scoresRef = useRef<BestScores>({});

  useEffect(() => {
    let cancelled = false;
    loadBestScores().then((saved) => {
      if (cancelled) return;
      const merged = mergeBestScores(saved, scoresRef.current);
      scoresRef.current = merged;
      setScores(merged);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Saves the score if it beats the current best. Returns true for a new best. */
  const recordScore = useCallback((deckId: string, score: BestScore): boolean => {
    if (!isBetterScore(score, scoresRef.current[deckId])) return false;
    const next = { ...scoresRef.current, [deckId]: score };
    scoresRef.current = next;
    setScores(next);
    void saveBestScores(next);
    return true;
  }, []);

  return { scores, recordScore };
}
