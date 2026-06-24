# ArcMotion

A simple, modern **workout tracker** for **Android & iOS**, built with Expo +
React Native + TypeScript. It keeps the no-fuss logging flow of a paper notebook
(Track → History → Graph per exercise) wrapped in a clean, modern, themeable
mobile UI.

## Features

- **Easy logging** — pick an exercise, dial in weight & reps with big steppers,
  tap _Save Set_. The best set of the day is auto-flagged with a 🏆.
- **Per-exercise Track / History / Graph tabs** — like a training journal.
- **Progress** — estimated-1RM trend per exercise (Epley formula) plus an overall
  weekly-volume chart and a "most trained" breakdown, drawn with `react-native-svg`.
- **History** — every workout grouped by day and exercise.
- **Custom exercises** — add your own (weighted or bodyweight) across muscle groups.
- **4 color themes** (Settings → Theme) that instantly recolor the whole app:
  - **Ocean** — clean modern blue (default)
  - **Midnight** — dark mode with an energizing neon lime
  - **Minimal** — paper-light and distraction-free
  - **Matcha Strawberry** — soft greens & strawberry pinks
- **kg / lb** unit toggle.
- **Offline-first** — data is stored privately on-device via AsyncStorage. No account.

## Tech stack

Expo (SDK 52) · React Native 0.76 · TypeScript · react-native-svg ·
@react-native-async-storage/async-storage · react-native-safe-area-context.

Theming is a React context that provides the active color **palette** object;
components read tokens from `useTheme()` instead of hard-coded colors, so
switching themes is instant.

## Run it (on your phone, no Android Studio / Xcode needed)

1. Install the **Expo Go** app from the Play Store / App Store.
2. On your computer:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code with Expo Go (Android) or the Camera app (iOS).

The app reloads live as the code changes.

## Build store binaries (later)

Uses Expo's cloud builder — no Mac required for iOS:

```bash
npm install -g eas-cli
eas login
eas build --platform android   # produces an .aab/.apk
eas build --platform ios       # produces an .ipa
```

## Project structure

```
App.tsx              theme + navigation shell
index.ts             Expo entry point
src/
  components/        BottomNav, Stepper, LineChart, SetRow, Icons, ui primitives
  context/           AppData (state + AsyncStorage), ThemeContext
  data/              seed exercises
  lib/               storage + formatting / 1RM helpers
  screens/           Workout, ExerciseDetail, History, Progress, Settings
  theme/             the 4 color palettes
```
