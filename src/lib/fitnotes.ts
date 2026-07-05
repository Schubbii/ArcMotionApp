import type { Equipment, Exercise, MuscleGroup, Routine, Workout, WorkoutEntry } from "../types";

/**
 * FitNotes (.fitnotes) import — pure mapping layer.
 *
 * A .fitnotes backup is a renamed SQLite database. The device-side code
 * (src/lib/transfer.ts) reads the raw rows; this module turns them into
 * ArcMotion data. Kept free of native imports so `npm test` can exercise it.
 *
 * Verified against a real backup: weights are always kilograms in
 * `metric_weight` (the `unit` column is only a display flag), workouts carry
 * a date but no time-of-day (`WorkoutTime` was empty), and set comments hang
 * off `Comment.owner_id` = `training_log._id` with owner_type_id = 1.
 */

export interface FnExerciseRow {
  _id: number;
  name: string;
  category_id: number;
  exercise_type_id: number;
}
export interface FnCategoryRow {
  _id: number;
  name: string;
}
export interface FnLogRow {
  _id: number;
  exercise_id: number;
  /** "yyyy-mm-dd" */
  date: string;
  /** Always kilograms. */
  metric_weight: number;
  reps: number;
}
export interface FnCommentRow {
  owner_id: number;
  comment: string;
}
export interface FnRoutineRow {
  _id: number;
  name: string;
}
export interface FnSectionRow {
  _id: number;
  routine_id: number;
  name: string;
  sort_order: number;
}
export interface FnSectionExerciseRow {
  routine_section_id: number;
  exercise_id: number;
  sort_order: number;
}

export interface FitNotesRaw {
  exercises: FnExerciseRow[];
  categories: FnCategoryRow[];
  logs: FnLogRow[];
  comments: FnCommentRow[];
  routines: FnRoutineRow[];
  sections: FnSectionRow[];
  sectionExercises: FnSectionExerciseRow[];
}

export interface FitNotesImport {
  /** Newly created exercises (existing name matches are reused, not duplicated). */
  newExercises: Exercise[];
  workouts: Workout[];
  routines: Routine[];
  stats: {
    workouts: number;
    sets: number;
    newExercises: number;
    matchedExercises: number;
    routines: number;
    notes: number;
    skippedSets: number;
  };
}

/** FitNotes stock category names → ArcMotion muscle groups. */
const CATEGORY_TO_GROUP: Record<string, MuscleGroup> = {
  shoulders: "Shoulders",
  chest: "Chest",
  back: "Back",
  legs: "Legs",
  triceps: "Arms",
  biceps: "Arms",
  arms: "Arms",
  abs: "Core",
  core: "Core",
  cardio: "Cardio",
};

const cap = (s: string, n: number) => s.trim().slice(0, n);
const norm = (s: string) => s.trim().toLowerCase();

function guessEquipment(name: string, group: MuscleGroup, typeId: number): Equipment {
  const n = norm(name);
  // Distance/time exercises (FitNotes type 1/3) and cardio are body-driven.
  if (typeId !== 0 || group === "Cardio") return "Bodyweight";
  if (/kettlebell/.test(n)) return "Kettlebell";
  if (/dumbbell/.test(n)) return "Dumbbell";
  if (/barbell|deadlift|ez.?bar|log press|landmine/.test(n)) return "Barbell";
  if (/cable|rope|pushdown|push.?down|pulldown|pull.?down|face pull/.test(n)) return "Cable";
  if (/machine|smith|leg press|pec deck|hack squat|leg extension|leg curl/.test(n)) return "Machine";
  if (/push.?up|pull.?up|chin.?up|\bdip\b|plank|crunch|sit.?up|leg raise|lunge|bridge|hyperextension/.test(n))
    return "Bodyweight";
  return "Other";
}

/** "Chest & Arms" style session title from the groups actually trained. */
function titleFromGroups(counts: Map<MuscleGroup, number>): string {
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g);
  if (top.length === 0) return "Workout";
  return top.slice(0, 2).join(" & ");
}

/**
 * Map raw FitNotes rows into ArcMotion data.
 *
 * Ids are deterministic (`fn-ex-…`, `fn-wo-…`, `fn-rt-…`) so importing the
 * same backup twice replaces instead of duplicating.
 */
export function mapFitNotes(raw: FitNotesRaw, existingExercises: Exercise[]): FitNotesImport {
  const categoryName = new Map(raw.categories.map((c) => [c._id, c.name]));
  const existingByName = new Map(existingExercises.map((e) => [norm(e.name), e]));

  // Only import exercises that are actually referenced — FitNotes ships a big
  // default library and pulling all of it in would bloat ArcMotion's.
  const used = new Set<number>();
  for (const l of raw.logs) used.add(l.exercise_id);
  for (const se of raw.sectionExercises) used.add(se.exercise_id);

  const idMap = new Map<number, string>(); // FitNotes exercise id → ArcMotion id
  const groupOf = new Map<string, MuscleGroup>(); // ArcMotion id → group (for titles)
  const newExercises: Exercise[] = [];
  let matchedExercises = 0;

  for (const fe of raw.exercises) {
    if (!used.has(fe._id)) continue;
    const name = cap(fe.name, 60);
    if (!name) continue;
    const catName = norm(categoryName.get(fe.category_id) ?? "");
    const group: MuscleGroup = CATEGORY_TO_GROUP[catName] ?? "Full Body";
    const match = existingByName.get(norm(name));
    if (match) {
      idMap.set(fe._id, match.id);
      groupOf.set(match.id, match.group);
      matchedExercises++;
    } else {
      const ex: Exercise = {
        id: `fn-ex-${fe._id}`,
        name,
        group,
        equipment: guessEquipment(name, group, fe.exercise_type_id),
        weighted: fe.exercise_type_id === 0,
      };
      idMap.set(fe._id, ex.id);
      groupOf.set(ex.id, ex.group);
      newExercises.push(ex);
    }
  }

  // Set comments keyed by training_log id.
  const commentByLog = new Map<number, string>();
  for (const c of raw.comments) {
    const text = cap(c.comment, 200);
    if (text) commentByLog.set(c.owner_id, text);
  }

  // One workout per calendar day; entries in first-logged order.
  const logsByDate = new Map<string, FnLogRow[]>();
  let skippedSets = 0;
  for (const l of [...raw.logs].sort((a, b) => a.date.localeCompare(b.date) || a._id - b._id)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(l.date) || !idMap.has(l.exercise_id)) {
      skippedSets++;
      continue;
    }
    // Time/distance-only rows (e.g. plank seconds) don't fit the set model.
    if (!(l.reps > 0 || l.metric_weight > 0)) {
      skippedSets++;
      continue;
    }
    const arr = logsByDate.get(l.date);
    if (arr) arr.push(l);
    else logsByDate.set(l.date, [l]);
  }

  const workouts: Workout[] = [];
  let totalSets = 0;
  let notes = 0;
  for (const [date, logs] of logsByDate) {
    const entryByExercise = new Map<string, WorkoutEntry>();
    const groupCounts = new Map<MuscleGroup, number>();
    for (const l of logs) {
      const exId = idMap.get(l.exercise_id)!;
      let entry = entryByExercise.get(exId);
      if (!entry) {
        entry = { id: `fn-en-${date}-${exId}`, exerciseId: exId, sets: [] };
        entryByExercise.set(exId, entry);
      }
      entry.sets.push({
        id: `fn-set-${l._id}`,
        weight: l.metric_weight,
        reps: l.reps,
        done: true,
        warmup: false,
      });
      const note = commentByLog.get(l._id);
      if (note) {
        notes++;
        // Several sets often repeat the same comment — keep each text once.
        if (!entry.note) entry.note = note;
        else if (!entry.note.split(" · ").includes(note)) entry.note = cap(`${entry.note} · ${note}`, 300);
      }
      const g = groupOf.get(exId);
      if (g) groupCounts.set(g, (groupCounts.get(g) ?? 0) + 1);
      totalSets++;
    }
    const entries = [...entryByExercise.values()];
    // FitNotes stores no time of day, so anchor at local noon; estimate a
    // plausible duration from set count (stats.ts ignores workouts w/o endTs).
    const [y, m, d] = date.split("-").map(Number);
    const startTs = new Date(y, m - 1, d, 12, 0, 0).getTime();
    const minutes = Math.min(150, Math.max(15, logs.length * 3));
    workouts.push({
      id: `fn-wo-${date}`,
      title: titleFromGroups(groupCounts),
      date,
      startTs,
      endTs: startTs + minutes * 60_000,
      entries,
    });
  }
  workouts.sort((a, b) => b.date.localeCompare(a.date)); // newest first, like the app stores them

  // Each FitNotes routine *section* ("Push 1") is what you actually start as a
  // session, so each becomes one ArcMotion routine.
  const routineName = new Map(raw.routines.map((r) => [r._id, r.name]));
  const routines: Routine[] = [];
  const sections = [...raw.sections].sort(
    (a, b) => a.routine_id - b.routine_id || a.sort_order - b.sort_order
  );
  for (const s of sections) {
    const parent = routineName.get(s.routine_id);
    if (!parent) continue;
    const exerciseIds = [...raw.sectionExercises]
      .filter((se) => se.routine_section_id === s._id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((se) => idMap.get(se.exercise_id))
      .filter((id): id is string => !!id);
    if (exerciseIds.length === 0) continue;
    routines.push({ id: `fn-rt-${s._id}`, name: cap(`${parent} · ${s.name}`, 60), exerciseIds });
  }

  return {
    newExercises,
    workouts,
    routines,
    stats: {
      workouts: workouts.length,
      sets: totalSets,
      newExercises: newExercises.length,
      matchedExercises,
      routines: routines.length,
      notes,
      skippedSets,
    },
  };
}
