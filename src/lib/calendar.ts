import type { Workout } from "../types";

/** Pure month-grid math for the History calendar (testable in the self-test). */

export interface MonthRef {
  year: number;
  /** 0-based like Date (0 = January). */
  month: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/**
 * Weeks of a month as ISO dates, Monday-first, padded with null outside the
 * month — exactly what a calendar grid renders row by row.
 */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => isoDate(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
  const d = new Date(ref.year, ref.month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(ref: MonthRef): string {
  return `${MONTHS[ref.month]} ${ref.year}`;
}

/**
 * For every trained date: which muscle groups were hit (most sets first,
 * capped for dot rendering) and which workout to open on tap (the latest).
 */
export function calendarDays(
  workouts: Workout[],
  groupOf: (exerciseId: string) => string | undefined,
  maxGroups = 3
): Map<string, { workoutId: string; groups: string[] }> {
  const byDate = new Map<string, { workoutId: string; ts: number; counts: Map<string, number> }>();
  for (const w of workouts) {
    if (!w.endTs) continue; // in-progress sessions don't belong on the calendar
    let day = byDate.get(w.date);
    if (!day) {
      day = { workoutId: w.id, ts: w.endTs, counts: new Map() };
      byDate.set(w.date, day);
    } else if (w.endTs > day.ts) {
      day.workoutId = w.id;
      day.ts = w.endTs;
    }
    for (const e of w.entries) {
      const g = groupOf(e.exerciseId);
      if (g) day.counts.set(g, (day.counts.get(g) ?? 0) + e.sets.length);
    }
  }
  const out = new Map<string, { workoutId: string; groups: string[] }>();
  for (const [date, d] of byDate) {
    const groups = [...d.counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxGroups)
      .map(([g]) => g);
    out.set(date, { workoutId: d.workoutId, groups });
  }
  return out;
}
