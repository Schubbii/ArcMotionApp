# ArcMotion

A simple, modern **workout tracker**. It keeps the no-fuss logging flow of a
paper notebook (track → history → graph per exercise) while wrapping it in a
clean, modern, themeable mobile UI.

## Features

- **Easy logging** — pick an exercise, dial in weight & reps with big steppers,
  tap _Save Set_. The best set of the day is auto-flagged with a 🏆.
- **Per-exercise Track / History / Graph tabs** — just like a training journal.
- **Progress graphs** — estimated 1RM trend per exercise (Epley formula) plus an
  overall weekly-volume chart, drawn with a dependency-free SVG chart.
- **History** — every workout grouped by day and exercise.
- **Custom exercises** — add your own (weighted or bodyweight) across muscle groups.
- **4 color themes** (Settings → Theme) that instantly recolor the whole app:
  - **Ocean** — clean modern blue (default)
  - **Midnight** — dark mode with an energizing neon lime
  - **Minimal** — paper-light and distraction-free
  - **Matcha Strawberry** — soft greens & strawberry pinks
- **kg / lb** unit toggle.
- **Offline-first** — all data is stored privately in the browser via
  `localStorage`. No account, no network.

## Tech

Vite + React + TypeScript. Theming is implemented with CSS custom properties
scoped by `[data-theme]`, so components only reference design tokens (never raw
colors) and switching themes is instant.

## Develop

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # typecheck + production build into dist/
npm run preview  # preview the production build
```

## Project structure

```
src/
  components/   reusable UI (BottomNav, Stepper, LineChart, Icons)
  context/      AppData provider (exercises, sets, settings + persistence)
  data/         seed exercises and theme definitions
  lib/          storage + formatting / 1RM helpers
  screens/      Workout, ExerciseDetail, History, Progress, Settings
  styles/       themes.css (the 4 palettes) + global.css
```
