import { act, renderHook } from '@testing-library/react-native';
import type { Card } from '../../types';
import { useStudySession } from '../useStudySession';

const cards: Card[] = [
  { id: 'a', front: 'A?', back: 'A' },
  { id: 'b', front: 'B?', back: 'B' },
  { id: 'c', front: 'C?', back: 'C' },
];

async function setup(deckCards: Card[] = cards) {
  const { result } = await renderHook(() => useStudySession('deck', deckCards));
  return result;
}

describe('useStudySession', () => {
  it('starts on the first card with nothing answered', async () => {
    const session = await setup();
    expect(session.current.currentCard).not.toBeNull();
    expect(session.current.position).toBe(1);
    expect(session.current.total).toBe(3);
    expect(session.current.knownCount).toBe(0);
    expect(session.current.progress).toBe(0);
    expect(session.current.isFinished).toBe(false);
    expect(session.current.result).toBeNull();
  });

  it('uses every card exactly once', async () => {
    const session = await setup();
    const seen: string[] = [];
    for (let i = 0; i < cards.length; i++) {
      seen.push(session.current.currentCard!.id);
      await act(() => session.current.markKnown());
    }
    expect([...seen].sort()).toEqual(['a', 'b', 'c']);
  });

  it('records known and unknown answers and finishes', async () => {
    const session = await setup();
    const first = session.current.currentCard!.id;
    await act(() => session.current.markKnown());
    const second = session.current.currentCard!.id;
    await act(() => session.current.markUnknown());
    expect(session.current.position).toBe(3);
    expect(session.current.knownCount).toBe(1);
    const third = session.current.currentCard!.id;
    await act(() => session.current.markUnknown());

    expect(session.current.isFinished).toBe(true);
    expect(session.current.currentCard).toBeNull();
    expect(session.current.progress).toBe(1);
    expect(session.current.result).toMatchObject({
      deckId: 'deck',
      known: [first],
      unknown: [second, third],
    });
  });

  it('ignores a repeated answer for the same card (fast double swipe)', async () => {
    const session = await setup();
    const markKnown = session.current.markKnown; // captured for the first card
    await act(() => {
      markKnown();
      markKnown();
    });
    expect(session.current.knownCount).toBe(1);
    expect(session.current.position).toBe(2);
  });

  it('ignores answers after the session is finished', async () => {
    const session = await setup([cards[0]]);
    await act(() => session.current.markKnown());
    const finished = session.current.result;
    await act(() => session.current.markUnknown());
    expect(session.current.result).toBe(finished);
  });

  it('handles an empty deck without crashing', async () => {
    const session = await setup([]);
    expect(session.current.isEmpty).toBe(true);
    expect(session.current.currentCard).toBeNull();
    expect(session.current.total).toBe(0);
    expect(session.current.isFinished).toBe(false);
    await act(() => session.current.markKnown());
    expect(session.current.result).toBeNull();
  });

  it('restart resets the session', async () => {
    const session = await setup();
    await act(() => session.current.markKnown());
    await act(() => session.current.restart());
    expect(session.current.position).toBe(1);
    expect(session.current.knownCount).toBe(0);
  });
});
