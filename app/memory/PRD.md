"# Speed Clicker / Reaction Time Game — PRD

## Overview
A native Expo mobile arcade game where players chase a teleporting neon target as fast as possible before the clock runs out. Pure client-side; no backend.

## Core Features (matches problem statement 1–4)
1. **Target Clicker** — A large glowing shape sits in the center of the arena. Each tap increments a `Score` counter shown at the top.
2. **Countdown Timer** — Player picks duration (10s / 20s / 30s). On START, a 3-2-1 countdown plays, then the timer ticks down. At 0 the target stops accepting taps and the Game Over modal opens with the final score.
3. **Random Teleport** — On every successful tap the target moves to a new random `(x, y)` inside the arena, changes shape (circle / square / triangle / star / hexagon), changes color, and rotates randomly.
4. **High Score Save** — Persisted in `AsyncStorage` under `speed_clicker_high_score_v1`. When the current score beats the saved high, the Game Over modal shows a glowing \"NEW HIGH SCORE!\" banner.

## User-Selected Polish
- **Combo / Streak multiplier** — Tapping within 800ms of the previous tap grows the combo (`2×`, `3×`…). A combo badge appears at 2+; success haptic fires every 5 in the streak. Max combo is shown on the Game Over screen.
- **Haptic feedback** — `expo-haptics` for taps, countdown ticks, milestones, final time, and Game Over.
- **Sound effects** — Delivered as tactile haptic feedback (selection / impact / notification) per design guideline mapping.

## Screens
- `/` Home — Title, high-score card with reset, duration chip row (10/20/30s), how-to-play card, sticky START GAME CTA.
- `/game` Game — Score pill, timer pill + progress bar, combo badge, arena with teleporting target, Ready/Countdown overlay, Game Over modal (NEW HIGH SCORE banner, final score, max combo / high score / duration stats, HOME + PLAY AGAIN actions).

## Design
- Dark neon arcade theme, Coral Red (#F43F5E) / Volt Green (#A3E635) / Neon Orange (#F97316) per `/app/design_guidelines.json`.
- All interactive elements have `testID` for automation.

## Tech
- Expo Router (file-based), React Native, `expo-linear-gradient`, `expo-haptics`, `@expo/vector-icons`, `@react-native-async-storage/async-storage`.
- No backend, no third-party integrations.
"