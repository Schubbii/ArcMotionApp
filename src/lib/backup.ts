import type { Exercise, Plan, Routine, Settings, Workout } from "../types";

/**
 * ArcMotion backup file format. Versioned so future schema changes can
 * migrate old files instead of rejecting them.
 */
export interface BackupFile {
  format: "arcmotion-backup";
  version: 1;
  /** ISO timestamp when the backup was created. */
  exportedAt: string;
  exercises: Exercise[];
  routines: Routine[];
  plans: Plan[];
  workouts: Workout[];
  settings: Settings;
}

/** The user-data slice a backup carries (everything except the live session). */
export interface AppSnapshot {
  exercises: Exercise[];
  routines: Routine[];
  plans: Plan[];
  workouts: Workout[];
  settings: Settings;
}

export function serializeBackup(snapshot: AppSnapshot): string {
  const file: BackupFile = {
    format: "arcmotion-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    ...snapshot,
  };
  return JSON.stringify(file);
}

/** Suggested file name for an export, e.g. "arcmotion-backup-2026-07-05.json". */
export function backupFileName(dateISO: string): string {
  return `arcmotion-backup-${dateISO}.json`;
}

export type ParseResult =
  | { ok: true; data: AppSnapshot; exportedAt: string }
  | { ok: false; error: string };

const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function validExercise(e: unknown): e is Exercise {
  if (typeof e !== "object" || e === null) return false;
  const x = e as Record<string, unknown>;
  return isStr(x.id) && isStr(x.name) && isStr(x.group) && isStr(x.equipment) && typeof x.weighted === "boolean";
}

function validRoutine(r: unknown): r is Routine {
  if (typeof r !== "object" || r === null) return false;
  const x = r as Record<string, unknown>;
  return isStr(x.id) && isStr(x.name) && Array.isArray(x.exerciseIds) && x.exerciseIds.every(isStr);
}

function validPlan(p: unknown): p is Plan {
  if (typeof p !== "object" || p === null) return false;
  const x = p as Record<string, unknown>;
  return isStr(x.id) && isStr(x.name) && Array.isArray(x.days) && x.days.every(validRoutine);
}

function validSet(s: unknown): boolean {
  if (typeof s !== "object" || s === null) return false;
  const x = s as Record<string, unknown>;
  return isStr(x.id) && isNum(x.weight) && isNum(x.reps) && typeof x.done === "boolean" && typeof x.warmup === "boolean";
}

function validWorkout(w: unknown): w is Workout {
  if (typeof w !== "object" || w === null) return false;
  const x = w as Record<string, unknown>;
  if (!(isStr(x.id) && isStr(x.title) && isStr(x.date) && isNum(x.startTs))) return false;
  if (x.endTs !== undefined && !isNum(x.endTs)) return false;
  if (!Array.isArray(x.entries)) return false;
  return x.entries.every((e) => {
    if (typeof e !== "object" || e === null) return false;
    const y = e as Record<string, unknown>;
    return isStr(y.id) && isStr(y.exerciseId) && Array.isArray(y.sets) && y.sets.every(validSet);
  });
}

/**
 * Parse + validate a backup file. Strict on structure (so a corrupt or foreign
 * file can't wipe good data with garbage) but lenient on settings, which are
 * re-merged with defaults on restore anyway.
 */
export function parseBackup(json: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: "Not a valid JSON file." };
  }
  if (typeof raw !== "object" || raw === null) return { ok: false, error: "Not a backup file." };
  const f = raw as Record<string, unknown>;
  if (f.format !== "arcmotion-backup") return { ok: false, error: "Not an ArcMotion backup file." };
  if (f.version !== 1) return { ok: false, error: `Unsupported backup version (${String(f.version)}).` };
  if (!Array.isArray(f.exercises) || !f.exercises.every(validExercise))
    return { ok: false, error: "Backup is damaged (exercises)." };
  if (!Array.isArray(f.routines) || !f.routines.every(validRoutine))
    return { ok: false, error: "Backup is damaged (routines)." };
  // Plans arrived after v1 shipped — old backups simply don't have the field.
  if (f.plans !== undefined && (!Array.isArray(f.plans) || !f.plans.every(validPlan)))
    return { ok: false, error: "Backup is damaged (plans)." };
  if (!Array.isArray(f.workouts) || !f.workouts.every(validWorkout))
    return { ok: false, error: "Backup is damaged (workouts)." };
  if (typeof f.settings !== "object" || f.settings === null)
    return { ok: false, error: "Backup is damaged (settings)." };
  return {
    ok: true,
    exportedAt: isStr(f.exportedAt) ? f.exportedAt : "",
    data: {
      exercises: f.exercises as Exercise[],
      routines: f.routines as Routine[],
      plans: (f.plans ?? []) as Plan[],
      workouts: f.workouts as Workout[],
      settings: f.settings as Settings,
    },
  };
}
