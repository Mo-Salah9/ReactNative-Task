# Flashcards

A small React Native (Expo + TypeScript) flashcards app. Pick a deck, tap a card to flip it, swipe right if you knew it and left if you didn't. At the end you see your score and can review only the cards you missed. The best score per deck is saved on the device.

## Run it

Requirements: Node 20+ and the **Expo Go** app on your phone (iOS or Android).

```bash
npm install
npm start          # then scan the QR code with Expo Go (Android) or the Camera app (iOS)
```

Other scripts:

| Command             | What it does                        |
| ------------------- | ----------------------------------- |
| `npm test`          | Jest tests for the session logic    |
| `npm run lint`      | ESLint (`eslint-config-expo`)       |
| `npm run typecheck` | TypeScript, strict mode, no `any`   |

## Features

- **Deck list**: name, card count and best score (for example `7/10`) for each deck.
- **Study**:
  - Tap to flip with a 3D animation. The back is never shown mirrored.
  - Swipe right to mark a card known and left to mark it not known. The card tilts as you drag, and a green or red label fades in.
  - A short swipe springs back; a long swipe or a quick flick sends the card off screen.
  - Know / Don't know buttons do exactly what the swipes do.
  - Top bar shows `Card 4 / 12`, a progress bar and the score.
  - Cards are shuffled at the start of every session.
  - Back (on-screen or Android hardware back) asks "Quit session?" before leaving.
- **Results**: the score as a number and a percentage, a message, the list of missed cards, and buttons for *Review missed* (hidden when nothing was missed), *Restart deck* and *Back to decks*.
- **Bonus**: dark mode that follows the system setting, haptics on swipe and flip, an Arabic deck with right-to-left card text, Jest tests.

## Project structure

```
App.tsx                  state-based navigator (decks → study → results)
src/
  types.ts               Card, Deck, SessionResult, BestScore
  data/                  decks.json + typed export
  hooks/
    useStudySession.ts   session logic: current card, markKnown/markUnknown, result
    useSwipeGesture.ts   PanResponder + Animated: drag, threshold, fly-off, spring-back
    useCardFlip.ts       flip animation state
    useBestScores.ts     best scores in memory + AsyncStorage
    useBackHandler.ts    Android hardware back button
  components/            FlashCard, SwipeableCard, ProgressBar, DeckItem, PrimaryButton, …
  screens/               DeckListScreen, StudyScreen, ResultsScreen
  storage/               AsyncStorage read/write with validation
  utils/                 pure functions: shuffle, session reducer, scoring, haptics
  theme/                 light/dark palettes + useTheme
```

## Design decisions

- **Logic and UI are separate.** Session rules live in a pure reducer (`utils/session.ts`) wrapped by `useStudySession`. Gesture math lives in `useSwipeGesture`. Components only render the props they get. The reducer and the swipe decision (`resolveSwipe`) are plain functions, so they're easy to test.
- **One code path for swipes and buttons.** The buttons call `swipe()` on the card through a ref, so they play the same fly-off animation and end up in the same `onSwiped` handler. They can't record a different result.
- **Fast repeated swipes are safe.** Each answer carries the id of the card it's for, and the reducer ignores it if that card isn't current anymore. The card also ignores gestures once it's flying off.
- **A new card means a new component.** `SwipeableCard` is keyed by card id, so every card mounts with fresh animation values. Nothing has to be reset by hand, and the old card never flashes back to the center.
- **Flip without mirrored text.** Each face rotates on the Y axis and fades out as it passes 90°. `backfaceVisibility` alone isn't reliable on every Android device.
- **Native-driver animations.** The flip, swipe and fly-off run on the UI thread (`useNativeDriver: true`). Only the progress bar width uses the JS driver, because width can't be animated natively.
- **Navigation without a library.** With three screens and no deep links, a typed `Route` union in `App.tsx` is simpler than React Navigation and keeps the flow easy to read. Each study session gets its own key, so restarting reshuffles cleanly.
- **Best scores are stored in the app root.** `useBestScores` updates memory first and writes to AsyncStorage in the background, so the deck list is up to date the moment you go back. Corrupt storage falls back to empty instead of crashing.
- **Only full-deck sessions count toward the best score.** A "review missed" session covers a smaller, easier set of cards, so counting it would inflate the score.

### Data model changes

The suggested model is kept, with two extra optional deck fields:

- `accent`: the deck's badge color on the list.
- `rtl`: marks a right-to-left deck (Arabic), so its card text is laid out RTL.

`BestScore` (`{ known, total, achievedAt }`) is stored per deck instead of a bare number, so the list can show `7/10` even after the deck changes size.

## Edge cases handled

- **Empty deck**: the *History* deck has no cards on purpose. It shows "No cards yet" in the list and an empty state in Study instead of crashing.
- **Fast repeated swipes or taps**: ignored after the first one (see above).
- **Quitting halfway**: a confirmation dialog appears for both the on-screen back button and Android hardware back. Nothing is saved for a quit session.
- **App goes to the background mid-drag**: the card springs back to the center (`AppState` listener, plus `onPanResponderTerminate`).
- **Small and large screens**: the card fills the available space up to a maximum size, safe-area insets are respected (notch and home indicator), and the results screen scrolls on small phones.

## What I'd improve with more time

- Move gestures to **Reanimated + Gesture Handler** for worklet-based gestures and smoother interruptions (for example, catching a card mid-spring).
- Full **app-wide RTL** (`I18nManager.forceRTL`), with mirrored layout and swipe directions. Today only the Arabic card text is RTL.
- Save an **in-progress session** so leaving the app and coming back resumes where you stopped.
- **Spaced repetition**: weight missed cards so they come up more often in later sessions.
- **Create and edit cards** in the app, saved locally.
- Component tests for `StudyScreen` (gesture simulation) and an E2E flow with Maestro.
