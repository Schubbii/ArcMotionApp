import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Equipment,
  Exercise,
  MuscleGroup,
  Routine,
  Settings,
  ThemeId,
  Workout,
  WeightUnit,
} from "../types";
import { DEFAULT_EXERCISES, DEFAULT_ROUTINES } from "../data/exercises";
import { DEFAULT_THEME } from "../theme/themes";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { previousSets } from "../lib/stats";
import { todayISO, uid } from "../lib/format";
import type { AppSnapshot } from "../lib/backup";
import type { FitNotesImport } from "../lib/fitnotes";

/** Everything needed to fully roll the app back, including the live session. */
interface SafetySnapshot extends AppSnapshot {
  ts: number;
  active: Workout | null;
}

interface AppDataValue {
  ready: boolean;
  exercises: Exercise[];
  routines: Routine[];
  workouts: Workout[];
  active: Workout | null;
  settings: Settings;

  // library / routines
  addExercise: (name: string, group: MuscleGroup, equipment: Equipment, weighted: boolean) => Exercise;
  exerciseById: (id: string) => Exercise | undefined;
  createRoutine: (name: string, exerciseIds: string[]) => void;
  deleteRoutine: (id: string) => void;

  // workout session
  startEmptyWorkout: () => void;
  startRoutine: (routineId: string) => void;
  /** Start a session with a given title and exercise list (used by the Library). */
  startWorkoutWith: (title: string, exerciseIds: string[]) => void;
  deleteWorkout: (id: string) => void;
  discardActive: () => void;
  finishActive: () => void;
  setActiveTitle: (title: string) => void;
  addExerciseToActive: (exerciseId: string) => void;
  removeEntry: (entryId: string) => void;
  addSet: (entryId: string) => void;
  updateSet: (entryId: string, setId: string, patch: { weight?: number; reps?: number }) => void;
  toggleSetDone: (entryId: string, setId: string) => void;
  toggleWarmup: (entryId: string, setId: string) => void;
  removeSet: (entryId: string, setId: string) => void;

  // settings
  setTheme: (theme: ThemeId) => void;
  setUnit: (unit: WeightUnit) => void;
  setWeightStep: (n: number) => void;
  setRepStep: (n: number) => void;
  setName: (name: string) => void;

  // backup / import (Settings → Data & Backup)
  /** Current user data, as written into an exported backup file. */
  exportSnapshot: () => AppSnapshot;
  /** Replace all data with a backup's contents (takes a safety snapshot first). */
  restoreBackup: (data: AppSnapshot) => void;
  /** Merge a mapped FitNotes import (takes a safety snapshot first). */
  importFitNotes: (data: FitNotesImport) => void;
  /** When set, an undo snapshot from before the last import/restore exists. */
  undoTs: number | null;
  /** Roll back to the state captured right before the last import/restore. */
  restoreLastSnapshot: () => Promise<boolean>;
}

const Ctx = createContext<AppDataValue | null>(null);
const DEFAULT_SETTINGS: Settings = {
  theme: DEFAULT_THEME,
  unit: "kg",
  weightStep: 2,
  repStep: 1,
  name: "",
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [active, setActive] = useState<Workout | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [undoTs, setUndoTs] = useState<number | null>(null);
  const loaded = useRef(false);

  // Hydrate once.
  useEffect(() => {
    (async () => {
      const [ex, ro, wo, ac, se, snap] = await Promise.all([
        loadJSON(STORAGE_KEYS.exercises, DEFAULT_EXERCISES),
        loadJSON(STORAGE_KEYS.routines, DEFAULT_ROUTINES),
        loadJSON(STORAGE_KEYS.workouts, [] as Workout[]),
        loadJSON<Workout | null>(STORAGE_KEYS.active, null),
        loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
        loadJSON<SafetySnapshot | null>(STORAGE_KEYS.snapshot, null),
      ]);
      // Merge new default exercises into stored lists so existing installs
      // gain library additions without losing user-created exercises.
      const have = new Set(ex.map((e) => e.id));
      const missing = DEFAULT_EXERCISES.filter((d) => !have.has(d.id));
      setExercises(missing.length ? [...ex, ...missing] : ex);
      setRoutines(ro);
      setWorkouts(wo);
      setActive(ac);
      // Merge with defaults so settings saved by older versions gain new fields.
      setSettings({ ...DEFAULT_SETTINGS, ...se });
      setUndoTs(snap?.ts ?? null);
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  // Persist on change (after hydrate).
  useEffect(() => { if (loaded.current) saveJSON(STORAGE_KEYS.exercises, exercises); }, [exercises]);
  useEffect(() => { if (loaded.current) saveJSON(STORAGE_KEYS.routines, routines); }, [routines]);
  useEffect(() => { if (loaded.current) saveJSON(STORAGE_KEYS.workouts, workouts); }, [workouts]);
  useEffect(() => { if (loaded.current) saveJSON(STORAGE_KEYS.active, active); }, [active]);
  useEffect(() => { if (loaded.current) saveJSON(STORAGE_KEYS.settings, settings); }, [settings]);

  const exerciseById = useCallback(
    (id: string) => exercises.find((e) => e.id === id),
    [exercises]
  );

  /** Build a fresh entry, pre-filling sets from the last time this exercise was done. */
  const buildEntry = useCallback(
    (exerciseId: string) => {
      const prev = previousSets(workouts, exerciseId);
      const sets =
        prev.length > 0
          ? prev.map((s) => ({
              id: uid(),
              weight: s.weight,
              reps: s.reps,
              done: false,
              warmup: s.warmup,
            }))
          : [{ id: uid(), weight: 0, reps: 0, done: false, warmup: false }];
      return { id: uid(), exerciseId, sets };
    },
    [workouts]
  );

  const value = useMemo<AppDataValue>(() => {
    const patchActive = (fn: (w: Workout) => Workout) =>
      setActive((cur) => (cur ? fn(cur) : cur));

    // Capture the full current state so an import/restore can be undone.
    const takeSafetySnapshot = () => {
      const ts = Date.now();
      const snap: SafetySnapshot = { ts, exercises, routines, workouts, settings, active };
      saveJSON(STORAGE_KEYS.snapshot, snap);
      setUndoTs(ts);
    };

    const newestFirst = (list: Workout[]) =>
      [...list].sort((a, b) => b.date.localeCompare(a.date) || (b.startTs ?? 0) - (a.startTs ?? 0));

    /** Replace-by-id then append — deterministic import ids make re-imports idempotent. */
    const upsert = <T extends { id: string }>(prev: T[], incoming: T[]): T[] => {
      const byId = new Map(incoming.map((x) => [x.id, x]));
      const have = new Set(prev.map((x) => x.id));
      return [...prev.map((x) => byId.get(x.id) ?? x), ...incoming.filter((x) => !have.has(x.id))];
    };

    const patchEntry = (entryId: string, fn: (e: Workout["entries"][number]) => Workout["entries"][number]) =>
      patchActive((w) => ({
        ...w,
        entries: w.entries.map((e) => (e.id === entryId ? fn(e) : e)),
      }));

    return {
      ready,
      exercises,
      routines,
      workouts,
      active,
      settings,

      addExercise: (name, group, equipment, weighted) => {
        const ex: Exercise = { id: uid(), name: name.trim().slice(0, 60), group, equipment, weighted };
        setExercises((prev) => [...prev, ex]);
        return ex;
      },
      exerciseById,
      createRoutine: (name, exerciseIds) =>
        setRoutines((prev) => [...prev, { id: uid(), name: name.trim().slice(0, 60), exerciseIds }]),
      deleteRoutine: (id) => setRoutines((prev) => prev.filter((r) => r.id !== id)),

      startEmptyWorkout: () =>
        setActive({
          id: uid(),
          title: "Workout",
          date: todayISO(),
          startTs: Date.now(),
          entries: [],
        }),
      startRoutine: (routineId) => {
        const routine = routines.find((r) => r.id === routineId);
        setActive({
          id: uid(),
          title: routine?.name ?? "Workout",
          date: todayISO(),
          startTs: Date.now(),
          entries: (routine?.exerciseIds ?? []).map(buildEntry),
        });
      },
      startWorkoutWith: (title, exerciseIds) =>
        setActive({
          id: uid(),
          title,
          date: todayISO(),
          startTs: Date.now(),
          entries: exerciseIds.map(buildEntry),
        }),
      deleteWorkout: (id) => setWorkouts((prev) => prev.filter((w) => w.id !== id)),
      discardActive: () => setActive(null),
      finishActive: () =>
        setActive((cur) => {
          if (cur) {
            const finished: Workout = { ...cur, endTs: Date.now() };
            // Only keep entries that have at least one completed set.
            finished.entries = finished.entries.filter((e) => e.sets.some((s) => s.done));
            if (finished.entries.length > 0) setWorkouts((prev) => [finished, ...prev]);
          }
          return null;
        }),
      setActiveTitle: (title) => patchActive((w) => ({ ...w, title })),
      addExerciseToActive: (exerciseId) =>
        patchActive((w) => ({ ...w, entries: [...w.entries, buildEntry(exerciseId)] })),
      removeEntry: (entryId) =>
        patchActive((w) => ({ ...w, entries: w.entries.filter((e) => e.id !== entryId) })),
      addSet: (entryId) =>
        patchEntry(entryId, (e) => {
          const last = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: uid(),
                weight: last?.weight ?? 0,
                reps: last?.reps ?? 0,
                done: false,
                warmup: false,
              },
            ],
          };
        }),
      updateSet: (entryId, setId, patch) =>
        patchEntry(entryId, (e) => ({
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        })),
      toggleSetDone: (entryId, setId) =>
        patchEntry(entryId, (e) => ({
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)),
        })),
      toggleWarmup: (entryId, setId) =>
        patchEntry(entryId, (e) => ({
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, warmup: !s.warmup } : s)),
        })),
      removeSet: (entryId, setId) =>
        patchEntry(entryId, (e) => ({ ...e, sets: e.sets.filter((s) => s.id !== setId) })),

      setTheme: (theme) => setSettings((p) => ({ ...p, theme })),
      setUnit: (unit) => setSettings((p) => ({ ...p, unit })),
      setWeightStep: (n) => setSettings((p) => ({ ...p, weightStep: Math.max(0.1, n) })),
      setRepStep: (n) => setSettings((p) => ({ ...p, repStep: Math.max(1, Math.round(n)) })),
      setName: (name) => setSettings((p) => ({ ...p, name: name.slice(0, 40) })),

      exportSnapshot: () => ({ exercises, routines, workouts, settings }),
      restoreBackup: (data) => {
        takeSafetySnapshot();
        // Same merges as hydrate, so a backup from an older app version still
        // gains new default exercises and settings fields.
        const have = new Set(data.exercises.map((e) => e.id));
        setExercises([...data.exercises, ...DEFAULT_EXERCISES.filter((d) => !have.has(d.id))]);
        setRoutines(data.routines);
        setWorkouts(newestFirst(data.workouts));
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        setActive(null); // the restored state replaces the world, live session included
      },
      importFitNotes: (data) => {
        takeSafetySnapshot();
        setExercises((prev) => upsert(prev, data.newExercises));
        setWorkouts((prev) => newestFirst(upsert(prev, data.workouts)));
        setRoutines((prev) => upsert(prev, data.routines));
      },
      undoTs,
      restoreLastSnapshot: async () => {
        const snap = await loadJSON<SafetySnapshot | null>(STORAGE_KEYS.snapshot, null);
        if (!snap) return false;
        setExercises(snap.exercises);
        setRoutines(snap.routines);
        setWorkouts(snap.workouts);
        setSettings({ ...DEFAULT_SETTINGS, ...snap.settings });
        setActive(snap.active);
        saveJSON(STORAGE_KEYS.snapshot, null);
        setUndoTs(null);
        return true;
      },
    };
  }, [ready, exercises, routines, workouts, active, settings, undoTs, exerciseById, buildEntry]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
