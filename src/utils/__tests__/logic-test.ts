import { resolveSwipe } from '../../hooks/useSwipeGesture';
import { formatBestScore, isBetterScore, summarizeResult } from '../score';
import { selectCards } from '../session';
import { shuffle } from '../shuffle';

describe('shuffle', () => {
  it('keeps every item and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5];
    const output = shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...output].sort()).toEqual(input);
  });
});

describe('selectCards', () => {
  const cards = [
    { id: 'a', front: '', back: '' },
    { id: 'b', front: '', back: '' },
    { id: 'c', front: '', back: '' },
  ];

  it('returns all cards for null', () => {
    expect(selectCards(cards, null)).toHaveLength(3);
  });

  it('returns only the requested cards', () => {
    expect(selectCards(cards, ['c', 'a']).map((card) => card.id)).toEqual(['a', 'c']);
  });
});

describe('summarizeResult', () => {
  it('computes score, percent and message', () => {
    const summary = summarizeResult({ deckId: 'd', known: ['a', 'b', 'c'], unknown: ['d'], finishedAt: 0 });
    expect(summary).toEqual({ known: 3, total: 4, percent: 75, message: 'Good effort — almost there.' });
  });
});

describe('isBetterScore', () => {
  const score = (known: number, total: number) => ({ known, total, achievedAt: 0 });

  it('accepts the first score', () => {
    expect(isBetterScore(score(1, 10), undefined)).toBe(true);
  });

  it('compares by ratio', () => {
    expect(isBetterScore(score(8, 10), score(7, 10))).toBe(true);
    expect(isBetterScore(score(7, 10), score(7, 10))).toBe(false);
    expect(isBetterScore(score(6, 10), score(7, 10))).toBe(false);
  });

  it('never stores a score for zero cards', () => {
    expect(isBetterScore(score(0, 0), undefined)).toBe(false);
  });

  it('formats a missing score', () => {
    expect(formatBestScore(undefined)).toBe('—');
    expect(formatBestScore(score(7, 10))).toBe('7/10');
  });
});

describe('resolveSwipe', () => {
  const width = 400; // threshold = 120px

  it('springs back on a short, slow drag', () => {
    expect(resolveSwipe(50, 0.1, width)).toBeNull();
  });

  it('swipes when past the distance threshold', () => {
    expect(resolveSwipe(130, 0, width)).toBe('right');
    expect(resolveSwipe(-130, 0, width)).toBe('left');
  });

  it('swipes on a fast flick in the same direction', () => {
    expect(resolveSwipe(60, 1.2, width)).toBe('right');
    expect(resolveSwipe(60, -1.2, width)).toBeNull();
  });
});
