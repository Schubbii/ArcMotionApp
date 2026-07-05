/**
 * Lightweight bug-test suite for ArcMotion's logic layer and data integrity.
 * Run with: npm test
 */
import {
  estimateOneRepMax,
  formatDateHeading,
  formatDuration,
  round,
  todayISO,
  uid,
} from "../src/lib/format";
import {
  exerciseDayStats,
  metricValue,
  METRIC_LABELS,
  personalRecord,
  previousSets,
  workingSets,
  workoutSetCount,
  workoutVolume,
} from "../src/lib/stats";
import type { Workout, WorkoutSet } from "../src/types";
import { DEFAULT_EXERCISES, DEFAULT_ROUTINES } from "../src/data/exercises";
import { PROGRAMS, PROGRAM_GOALS } from "../src/data/programs";
import { THEMES, DEFAULT_THEME, paletteFor } from "../src/theme/themes";

let passed = 0;
let failed = 0;

function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ---------------------------------------------------------------- format.ts
console.log("format.ts");
check("1RM of a single at 100 is 100", estimateOneRepMax(100, 1) === 100);
check("1RM Epley 100x10 ≈ 133.33", Math.abs(estimateOneRepMax(100, 10) - 133.333) < 0.01);
check("1RM with 0 reps returns weight", estimateOneRepMax(100, 0) === 100);
check("1RM with 0 weight returns 0", estimateOneRepMax(0, 8) === 0);
check("round(1.256) = 1.3", round(1.256) === 1.3);
check("round(1.256, 2) = 1.26", round(1.256, 2) === 1.26);
check("formatDuration 0ms = 0s", formatDuration(0) === "0s");
check("formatDuration 59s", formatDuration(59_000) === "59s");
check("formatDuration 65s = 1min", formatDuration(65_000) === "1min");
check("formatDuration 4500s = 1h 15min", formatDuration(4_500_000) === "1h 15min");
check("formatDuration negative clamps to 0s", formatDuration(-500) === "0s");
check("todayISO shape yyyy-mm-dd", /^\d{4}-\d{2}-\d{2}$/.test(todayISO()));
check("formatDateHeading(today) = Today", formatDateHeading(todayISO()) === "Today");
check(
  "uid uniqueness over 5000 draws",
  new Set(Array.from({ length: 5000 }, () => uid())).size === 5000
);

// ----------------------------------------------------------------- stats.ts
console.log("stats.ts");
const set = (over: Partial<WorkoutSet>): WorkoutSet => ({
  id: uid(),
  weight: 100,
  reps: 5,
  done: true,
  warmup: false,
  ...over,
});

const w1: Workout = {
  id: "w1",
  title: "A",
  date: "2026-07-01",
  startTs: 1_000,
  endTs: 2_000,
  entries: [
    {
      id: "e1",
      exerciseId: "bench-bb",
      sets: [
        set({ weight: 60, reps: 8, warmup: true }), // warmup — excluded
        set({ weight: 100, reps: 5 }),
        set({ weight: 105, reps: 3 }),
        set({ weight: 110, reps: 1, done: false }), // not done — excluded
        set({ weight: 120, reps: 0 }), // 0 reps — excluded
      ],
    },
  ],
};
const w2: Workout = {
  id: "w2",
  title: "B",
  date: "2026-07-02",
  startTs: 3_000,
  endTs: 4_000,
  entries: [
    { id: "e2", exerciseId: "bench-bb", sets: [set({ weight: 107.5, reps: 2 })] },
  ],
};
const active: Workout = {
  id: "w3",
  title: "C",
  date: "2026-07-03",
  startTs: 5_000, // no endTs — in progress, must be ignored by stats
  entries: [{ id: "e3", exerciseId: "bench-bb", sets: [set({ weight: 999, reps: 9 })] }],
};
const all = [w2, w1, active];

check("workingSets filters warmup/undone/0-rep", workingSets(w1.entries[0].sets).length === 2);
check("workoutVolume excludes warmups", workoutVolume(w1) === 100 * 5 + 105 * 3);
check("workoutSetCount", workoutSetCount(w1) === 2);
check("empty workout volume is 0", workoutVolume({ ...w1, entries: [] }) === 0);

const prev = previousSets(all, "bench-bb");
check("previousSets picks most recent finished workout", prev.length === 1 && prev[0].weight === 107.5);
const prevExcl = previousSets(all, "bench-bb", "w2");
check("previousSets can exclude a workout id", prevExcl.some((s) => s.weight === 100));
check("previousSets unknown exercise = []", previousSets(all, "nope").length === 0);

const days = exerciseDayStats(all, "bench-bb");
check("exerciseDayStats ignores unfinished workouts", days.length === 2);
check("exerciseDayStats sorted ascending", days[0].date === "2026-07-01" && days[1].date === "2026-07-02");
check("day heaviest", days[0].heaviest === 105);
check("day volume", days[0].volume === 815);
check("day reps", days[0].reps === 8);
// Best e1RM of the day: 100×5 → 116.67 beats 105×3 → 115.5.
check("day 1RM uses best estimated", Math.abs(days[0].oneRm - 100 * (1 + 5 / 30)) < 0.11);
for (const m of ["heaviest", "1rm", "volume", "reps"] as const) {
  check(`metricValue(${m}) finite + labeled`, Number.isFinite(metricValue(days[0], m)) && !!METRIC_LABELS[m]);
}
check("personalRecord ignores active + warmups", personalRecord(all, "bench-bb") === 107.5);
check("personalRecord unknown exercise = 0", personalRecord(all, "nope") === 0);

// ------------------------------------------------------------ data integrity
console.log("data integrity");
const ids = new Set(DEFAULT_EXERCISES.map((e) => e.id));
check("no duplicate exercise ids", ids.size === DEFAULT_EXERCISES.length);
check("every exercise has a non-empty name ≤ 60", DEFAULT_EXERCISES.every((e) => e.name.trim().length > 0 && e.name.length <= 60));
check("135+ exercises? (>=110)", DEFAULT_EXERCISES.length >= 110, String(DEFAULT_EXERCISES.length));

for (const r of DEFAULT_ROUTINES) {
  check(`routine "${r.name}" ids resolve`, r.exerciseIds.every((id) => ids.has(id)));
}
const programIds = new Set(PROGRAMS.map((p) => p.id));
check("no duplicate program ids", programIds.size === PROGRAMS.length);
for (const p of PROGRAMS) {
  check(`program "${p.name}" ids resolve`, p.exerciseIds.every((id) => ids.has(id)));
  check(`program "${p.name}" goal is listed`, PROGRAM_GOALS.includes(p.goal));
  check(`program "${p.name}" has 3+ exercises + description`, p.exerciseIds.length >= 3 && p.description.length > 20);
}

// ------------------------------------------------------------------- themes
console.log("themes");
const themeIds = new Set(THEMES.map((t) => t.id));
check("no duplicate theme ids", themeIds.size === THEMES.length);
check("10 themes", THEMES.length === 10, String(THEMES.length));
check("DEFAULT_THEME exists", themeIds.has(DEFAULT_THEME));
check("paletteFor falls back for unknown id", paletteFor("nope" as never) === THEMES[0].palette);
const refKeys = Object.keys(THEMES[0].palette).sort().join(",");
for (const th of THEMES) {
  check(`theme ${th.id}: palette keys complete`, Object.keys(th.palette).sort().join(",") === refKeys);
  check(`theme ${th.id}: 4 swatches`, th.swatches.length === 4);
  check(
    `theme ${th.id}: colors are hex/rgba`,
    Object.entries(th.palette).every(
      ([k, v]) => typeof v !== "string" || /^#([0-9a-f]{3,8})$/i.test(v) || /^rgba?\(/.test(v)
    )
  );
  check(`theme ${th.id}: blobOpacity sane (0..0.6)`, th.palette.blobOpacity > 0 && th.palette.blobOpacity <= 0.6);
}

// -------------------------------------------------------------------- result
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
