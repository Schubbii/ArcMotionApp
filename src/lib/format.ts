import type { SetEntry } from "../types";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Estimated one-rep max via the Epley formula. */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** The "best" set of a group is the one with the highest estimated 1RM. */
export function bestSetId(sets: SetEntry[]): string | null {
  let best: SetEntry | null = null;
  let bestE1rm = -1;
  for (const s of sets) {
    const e = estimateOneRepMax(s.weight, s.reps);
    if (e > bestE1rm) {
      bestE1rm = e;
      best = s;
    }
  }
  return best?.id ?? null;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDateHeading(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = todayISO();
  if (iso === today) return "Today";
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (iso === yest.toISOString().slice(0, 10)) return "Yesterday";
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${d}`;
}

export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

export function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
