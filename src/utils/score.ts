import type { BestScore, SessionResult } from '../types';

export type ResultSummary = {
  known: number;
  total: number;
  percent: number;
  message: string;
};

export function getResultMessage(percent: number): string {
  if (percent === 100) return 'Perfect score!';
  if (percent >= 80) return 'Great job!';
  if (percent >= 50) return 'Good effort — almost there.';
  return 'Keep practicing!';
}

export function summarizeResult(result: SessionResult): ResultSummary {
  const known = result.known.length;
  const total = known + result.unknown.length;
  const percent = total === 0 ? 0 : Math.round((known / total) * 100);
  return { known, total, percent, message: getResultMessage(percent) };
}

/** A score is better if its ratio is higher, or the ratio is equal but more cards were known. */
export function isBetterScore(candidate: BestScore, previous: BestScore | undefined): boolean {
  if (candidate.total === 0) return false;
  if (!previous || previous.total === 0) return true;
  // Cross-multiply to compare ratios without floating point rounding.
  const lhs = candidate.known * previous.total;
  const rhs = previous.known * candidate.total;
  return lhs > rhs || (lhs === rhs && candidate.known > previous.known);
}

export function formatBestScore(score: BestScore | undefined): string {
  return score ? `${score.known}/${score.total}` : '—';
}

export function formatCardCount(count: number): string {
  if (count === 0) return 'No cards yet';
  return count === 1 ? '1 card' : `${count} cards`;
}
