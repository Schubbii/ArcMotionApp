# ArcMotion

A workout tracker for **Android & iOS** built with **Expo + React Native + TypeScript**.

It blends three influences:
- **Hevy** — professional, session-based logging (live Time/Volume/Sets header,
  set table with previous-set reference, warmup sets, "Finish"), routines, an
  exercise search with muscle filters, PR badges and metric graphs.
- **FitNotes** — minimal-tap simplicity and a per-exercise Track/History/Graph view.
- **Gravl** — a bold, modern, dark aesthetic (electric-lime accent, uppercase
  section headers, rounded cards) as the default theme.

## Features

- **Log a workout** — start empty or from a routine. Each exercise has a set
  table (`SET · PREVIOUS · KG · REPS · ✓`); tap a set number to mark it a warmup
  (`W`), long-press to delete. Live session timer + running volume & set count.
- **Routines** — create reusable routines from the exercise library and start
  them in one tap.
- **Exercise library** — 35+ seeded exercises with muscle group & equipment;
  search, filter by muscle, or create your own.
- **History** — every finished workout as a summary card (duration, volume, sets,
  top set per exercise).
- **Progress** — overall stats, weekly-volume trend, and per-exercise analysis
  with four metrics (Heaviest Weight, One Rep Max, Best Volume, # of Reps) plus a
  personal-record badge.
- **4 color themes** (Settings → Color Theme), instantly recoloring the app:
  - **Volt** — dark + electric lime (default)
  - **Ocean** — clean professional blue
  - **Carbon** — deep dark + indigo
  - **Matcha Strawberry** — soft greens & strawberry pinks
- **kg / lb** toggle. **Offline-first** — data stored privately on-device via AsyncStorage.

## Tech stack

Expo SDK 54 · React Native 0.81 · React 19 · TypeScript · react-native-svg ·
@react-native-async-storage/async-storage · react-native-safe-area-context.

Theming is a React context exposing the active **palette**; components read tokens
via `useTheme()` instead of hard-coded colors, so switching themes is instant.

## Run it (on your phone — no Android Studio / Xcode needed)

1. Install **Expo Go** from the Play Store / App Store.
2. On your computer:
   ```bash
   npm install
   npx expo start -c
   ```
3. Scan the QR code with Expo Go (Android) or the Camera app (iOS).

> Uses Expo SDK 54 to match the Expo Go app currently in the stores.

## Build store binaries (later)

```bash
npm install -g eas-cli
eas login
eas build --platform android   # .aab / .apk
eas build --platform ios       # .ipa (no Mac required — cloud build)
```

## Project structure

```
App.tsx                theme provider + route/tab navigation
index.ts               Expo entry point
src/
  components/          BottomNav, LineChart, AddExerciseModal, Icons, ui primitives
  context/AppData.tsx  app state (library, routines, workouts, active session) + persistence
  data/exercises.ts    seed exercise library + starter routines
  lib/                 storage, formatting, and stats/PR helpers
  screens/             WorkoutHome, ActiveWorkout, NewRoutine, History, Progress,
                       ExerciseDetail, Settings
  theme/               the 4 color palettes + ThemeContext
```
