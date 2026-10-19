import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BestScore, BestScores } from '../types';

const STORAGE_KEY = 'flashcards:bestScores:v1';

function isBestScore(value: unknown): value is BestScore {
  if (typeof value !== 'object' || value === null) return false;
  const { known, total, achievedAt } = value as Record<string, unknown>;
  return typeof known === 'number' && typeof total === 'number' && typeof achievedAt === 'number';
}

/** Reads saved best scores. Corrupt or missing data falls back to an empty object. */
export async function loadBestScores(): Promise<BestScores> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const scores: BestScores = {};
    for (const [deckId, value] of Object.entries(parsed)) {
      if (isBestScore(value)) scores[deckId] = value;
    }
    return scores;
  } catch {
    return {};
  }
}

export async function saveBestScores(scores: BestScores): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Saving is best-effort: the score stays in memory for this run.
  }
}
