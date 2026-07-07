# CLAUDE.md — ArcMotion

Guidance for Claude Code (and humans) working in this repo. Read this first.

## What this is

**ArcMotion** — a workout tracker for **Android & iOS**, built with
**Expo + React Native + TypeScript**. It blends Hevy's session-based logging,
FitNotes' simplicity, and a Gravl-style modern dark aesthetic. Offline-first:
all data lives on-device (AsyncStorage), no backend, no accounts.

- **Working branch:** `claude/expo-mobile` (this is where all work goes).
- **Default/base branch:** `Development`.
- The web app in branch `claude/zealous-hawking-h1ly31` is a separate earlier
  prototype — ignore it unless asked.

## Tech stack & versions (do not casually bump)

- **Expo SDK 54** · React Native 0.81 · React 19.1 · TypeScript.
- Key libs: `react-native-svg`, `@react-native-async-storage/async-storage`,
  `react-native-safe-area-context`, `expo-blur`, `expo-status-bar`, `expo-asset`.
- Data & Backup (all bundled in Expo Go, no dev build needed): `expo-sqlite`
  (FitNotes import), `expo-document-picker`, `expo-file-system` (we use the
  `/legacy` string-path API), `expo-sharing`.
- Web preview (for UX testing only): `react-dom`, `react-native-web`.

### ⚠️ SDK version is load-bearing

Expo Go only runs the **single SDK** it was built for. We are pinned to **SDK 54**
because that's what the store's Expo Go supported during development. SDK 55/56
exist on npm but their Expo Go apps weren't released yet — targeting them caused
"Project is incompatible with this version of Expo Go". If you must change SDK:
match dependency versions from `node_modules/expo/bundledNativeModules.json`
(the network version API is blocked in this environment; read the local file).

## Commands

```bash
npm test                 # tsx self-test suite (185 assertions) — run after logic changes
npx tsc --noEmit         # typecheck — must pass before committing
npx expo start -c        # dev server for Expo Go (device testing)
# Bundle sanity (no device needed) — the CI-substitute we rely on here:
EXPO_NO_TELEMETRY=1 CI=1 npx expo export --platform android --output-dir /tmp/arc-export
# Web preview for UX walkthroughs (Alerts fall back to window.confirm):
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081
```

**Before every commit:** `npx tsc --noEmit` clean **and** the Android
`expo export` bundle succeeds. Run `npm test` when you touch anything in
`src/lib`, `src/data`, or `src/theme`.

## Architecture

```
App.tsx                  Theme provider + onboarding gate + route/tab router
                         (also owns Android back-handler + ResumeBar mount)
index.ts                 Expo entry (registerRootComponent)
src/
  context/AppData.tsx    THE state hub: exercises, routines, workouts, active
                         session, settings. Hydrates from + persists to
                         AsyncStorage. All mutations go through here.
  theme/
    themes.ts            The 10 color palettes + Palette token type
    ThemeContext.tsx     useTheme() -> active palette
  data/
    exercises.ts         ~134 seed exercises + starter routines
    programs.ts          15 prebuilt Library programs (by goal)
  lib/
    format.ts            dates, durations, uid, 1RM (Epley), rounding
    stats.ts             volume, working-sets, day-stats, PRs, previousSets
    storage.ts           typed AsyncStorage JSON wrappers
    dialogs.ts           showDialog() — cross-platform Alert/confirm
    backup.ts            versioned backup file format + strict parse/validate
    fitnotes.ts          pure FitNotes(.fitnotes SQLite) → ArcMotion mapping
    transfer.ts          file IO: export/share backup, pick+read backup or
                         FitNotes DB (native-only; expo-sqlite via cache dir)
    plans.ts             Plan merge + legacy flat-routine → Plan migration
    calendar.ts          month-grid math + trained-groups-per-day for Calendar
  components/            BottomNav, ResumeBar, Glass, GlassBackdrop, LineChart,
                         Stepper, SetRow, AddExerciseModal, ArcLogo, Icons,
                         ui (Card/Pill/buttons/etc.), motion (PressableScale,
                         FadeSlideIn)
  screens/               WorkoutHome, ActiveWorkout, NewRoutine, Library,
                         PlanDetail (plan/program preview + start day),
                         History, WorkoutDetail, Calendar, Progress,
                         ExerciseDetail, Settings, Onboarding
scripts/selftest.ts      the `npm test` suite
docs/UX_REPORT.md        browser UX walkthrough + status of all findings
```

Navigation is a **hand-rolled router** in `App.tsx` (no navigation lib): a `tab`
state for the 5 bottom tabs + a `route` state for pushed full-screens (active
workout, new routine, exercise detail). Android hardware/gesture back is wired
into it via `BackHandler`.

## Conventions (follow these — they're enforced by taste, not lint)

- **Colors:** never hard-code hex in components. Read tokens from `useTheme()`.
  New UI must work across all 10 themes (light + dark).
- **Glass vs solid:** decorative surfaces (cards, tiles, tab bar) use the
  translucent `glassSurface`/`Glass` treatment. **Actionable floating controls**
  (e.g. ResumeBar) must use a **solid** `surface` so content doesn't bleed
  through. Keep real backdrop blur to the tab bar only (Android perf).
- **Dialogs:** use `showDialog` from `src/lib/dialogs.ts`, never `Alert.alert`
  directly — `Alert` is a silent no-op on web and breaks UX testing.
- **Animations:** use `PressableScale` for tappables and `FadeSlideIn` for
  screen entrances (`src/components/motion.tsx`). Native driver only; don't mix
  a JS-driven `width` animation with a native `transform` on one node
  (it crashes — animate position, set width statically).
- **State:** all reads/writes of exercises/routines/workouts/settings go through
  `useAppData()`. It merges new default exercises + new settings fields into
  existing installs on load — preserve that when adding fields.
- **Inputs:** trim + length-cap user text (names capped at 60). Guard numeric
  parses against `NaN`. Confirm destructive actions (discard/delete) via dialog.
- **Comments:** explain *why*, not *what*. Match surrounding style.

## Theming

10 themes in `themes.ts`: `volt` (default, dark lime), `ocean`, `carbon`,
`matcha` (Matcha Strawberry), `crimson` (black/red), `bluelock`, `shadow`
(Solo Leveling), `sunset`, `mocha`, `aurora`. Each palette must define **every**
token (the self-test verifies key completeness) incl. glass + blob tokens.

## Assets / branding

Logo source: `src/AppLogo/Frame 1.svg` (user-provided vector). The in-app mark
is `src/components/ArcLogo.tsx`; launcher/splash PNGs in `assets/` are rasterized
from the same path and **optically centered** on the shape's centroid
(~776.8, 735.6 in the 1474 box), not the bbox — the mark is top/left-heavy.
Regeneration script lives in the scratchpad (uses `sharp`).

## Distribution

- **Dev:** Expo Go + `npx expo start`. Icon/splash changes are NOT visible in
  Expo Go — only in a real build.
- **Builds:** EAS is configured (`eas.json`, profiles: development/preview/
  production; `preview` → installable `.apk`). Project is linked
  (`extra.eas.projectId` in app.json). See `BUILD.md`.
- **OTA updates:** `expo-updates` is set up (`updates.url` + `runtimeVersion`
  policy `appVersion` in app.json; each build profile has a `channel`). After a
  preview build is on-device, ship JS/asset changes with
  `eas update --branch preview` — no rebuild. Native/version changes still need
  a rebuild. Details in `BUILD.md`.

## Git / workflow

- Commit as `Claude <noreply@anthropic.com>`; work on `claude/expo-mobile`.
- Never commit the model identifier into code/commits/PRs.
- The git remote is a proxy; if `git push` 403s transiently, retry with backoff.
- `.fitnotes` files (user backups) are renamed SQLite DBs. The import is BUILT
  (Settings → Data & Backup): `src/lib/fitnotes.ts` maps `training_log`,
  `exercise`, `Category`, `Routine*` rows. FitNotes routines become Library
  **Plans** (`Plan` in types.ts) whose sections are startable days — never
  flatten them back into standalone routines. Weights are always kg in
  `metric_weight` (the `unit` column is display-only), `Comment.owner_type_id=1`
  rows are per-set notes, `WorkoutTime` may be empty (no time-of-day → we anchor
  imported workouts at local noon and estimate duration from set count, since
  stats.ts ignores workouts without `endTs`). Import ids are deterministic
  (`fn-…`) so re-imports replace instead of duplicate. Never commit a user's
  real `.fitnotes` file — it's personal training data.

## Known caveats

- npm audit shows moderate advisories — all in Expo's dev build tooling
  (`@expo/cli` → xcode/uuid/postcss/js-yaml). None ship to devices. Do **not**
  run `npm audit fix --force` (it breaks the pinned SDK alignment).
- Web preview is for flow/UX only; real blur and some native behaviors differ.
