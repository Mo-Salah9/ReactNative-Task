export type Card = {
  id: string;
  front: string; // question
  back: string; // answer
};

export type Deck = {
  id: string;
  title: string;
  accent: string; // badge color shown on the deck list
  rtl?: boolean; // card text is right-to-left (e.g. Arabic)
  cards: Card[];
};

export type SessionResult = {
  deckId: string;
  known: string[]; // card ids
  unknown: string[]; // card ids
  finishedAt: number;
};

export type BestScore = {
  known: number;
  total: number;
  achievedAt: number;
};

export type BestScores = Record<string, BestScore>;

export type SwipeDirection = 'left' | 'right';
