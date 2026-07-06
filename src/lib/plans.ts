import type { Plan, Routine } from "../types";

/**
 * Plan helpers: merging imports and migrating data from the first FitNotes
 * import version, which flattened every routine section into a standalone
 * routine named "Plan · Day" (id fn-rt-…). Those now live as Plans with days.
 */

const norm = (s: string) => s.trim().toLowerCase();

/** Stable id-safe slug for plan names ("Bro Split" → "bro-split"). */
function slug(s: string): string {
  return (
    norm(s)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "plan"
  );
}

/**
 * Pull legacy flat import routines ("PPLU · Push 1", id fn-rt-…) out of the
 * routines list and rebuild the plans they came from. Runs on every hydrate /
 * restore; a no-op when nothing matches.
 */
export function splitLegacyImportRoutines(routines: Routine[]): {
  routines: Routine[];
  plans: Plan[];
} {
  const keep: Routine[] = [];
  const byPlanName = new Map<string, Plan>();
  for (const r of routines) {
    if (!r.id.startsWith("fn-rt-")) {
      keep.push(r);
      continue;
    }
    // "PPLU · Dienstag - Pull" → plan "PPLU", day "Dienstag - Pull".
    const sep = r.name.indexOf(" · ");
    const planName = sep > 0 ? r.name.slice(0, sep) : r.name;
    const dayName = sep > 0 ? r.name.slice(sep + 3) : "Day";
    let plan = byPlanName.get(norm(planName));
    if (!plan) {
      plan = { id: `fn-pl-${slug(planName)}`, name: planName, days: [] };
      byPlanName.set(norm(planName), plan);
    }
    plan.days.push({ id: r.id, name: dayName, exerciseIds: r.exerciseIds });
  }
  return { routines: keep, plans: [...byPlanName.values()] };
}

/**
 * Merge imported plans into the existing list. Matches by id or by name
 * (case-insensitive) so a re-import — or an import after the legacy
 * migration, which uses different ids — replaces instead of duplicating.
 */
export function mergePlans(prev: Plan[], incoming: Plan[]): Plan[] {
  const next = [...prev];
  for (const p of incoming) {
    const i = next.findIndex((x) => x.id === p.id || norm(x.name) === norm(p.name));
    if (i >= 0) next[i] = p;
    else next.push(p);
  }
  return next;
}
