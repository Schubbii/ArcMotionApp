import type { Metric, Workout, WorkoutSet } from "../types";
import { estimateOneRepMax, round } from "./format";

/** Working (non-warmup) sets that were actually completed. */
export function workingSets(sets: WorkoutSet[]): WorkoutSet[] {
  return sets.filter((s) => s.done && !s.warmup && s.reps > 0);
}

/** Total volume (weight × reps) of a workout's completed working sets. */
export function workoutVolume(workout: Workout): number {
  let v = 0;
  for (const e of workout.entries) {
    for (const s of workingSets(e.sets)) v += s.weight * s.reps;
  }
  return Math.round(v);
}

/** Count of completed working sets in a workout. */
export function workoutSetCount(workout: Workout): number {
  let n = 0;
  for (const e of workout.entries) n += workingSets(e.sets).length;
  return n;
}

export interface ExerciseDayStat {
  date: string;
  ts: number;
  heaviest: number;
  oneRm: number;
  volume: number;
  reps: number;
}

/**
 * For one exercise, reduce each completed workout to a single day stat across
 * all four Hevy metrics.
 */
export function exerciseDayStats(workouts: Workout[], exerciseId: string): ExerciseDayStat[] {
  const out: ExerciseDayStat[] = [];
  for (const w of workouts) {
    if (!w.endTs) continue;
    const sets = w.entries
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => workingSets(e.sets));
    if (sets.length === 0) continue;

    let heaviest = 0;
    let oneRm = 0;
    let volume = 0;
    let reps = 0;
    for (const s of sets) {
      heaviest = Math.max(heaviest, s.weight);
      oneRm = Math.max(oneRm, estimateOneRepMax(s.weight, s.reps));
      volume += s.weight * s.reps;
      reps += s.reps;
    }
    out.push({
      date: w.date,
      ts: w.endTs,
      heaviest: round(heaviest),
      oneRm: round(oneRm),
      volume: Math.round(volume),
      reps,
    });
  }
  return out.sort((a, b) => a.ts - b.ts);
}

export function metricValue(stat: ExerciseDayStat, metric: Metric): number {
  switch (metric) {
    case "heaviest":
      return stat.heaviest;
    case "1rm":
      return stat.oneRm;
    case "volume":
      return stat.volume;
    case "reps":
      return stat.reps;
  }
}

export const METRIC_LABELS: Record<Metric, string> = {
  heaviest: "Heaviest Weight",
  "1rm": "One Rep Max",
  volume: "Best Volume",
  reps: "# of Reps",
};

/** Personal record (best heaviest set ever) for an exercise. */
export function personalRecord(workouts: Workout[], exerciseId: string): number {
  let best = 0;
  for (const w of workouts) {
    if (!w.endTs) continue;
    for (const e of w.entries) {
      if (e.exerciseId !== exerciseId) continue;
      for (const s of workingSets(e.sets)) best = Math.max(best, s.weight);
    }
  }
  return round(best);
}

/**
 * The most recent completed set list for an exercise prior to the active
 * workout — used to show the "Previous" column.
 */
export function previousSets(
  workouts: Workout[],
  exerciseId: string,
  excludeWorkoutId?: string
): WorkoutSet[] {
  const past = workouts
    .filter((w) => w.endTs && w.id !== excludeWorkoutId)
    .sort((a, b) => (b.endTs ?? 0) - (a.endTs ?? 0));
  for (const w of past) {
    const entry = w.entries.find((e) => e.exerciseId === exerciseId);
    if (entry) {
      const sets = entry.sets.filter((s) => s.done);
      if (sets.length) return sets;
    }
  }
  return [];
}
