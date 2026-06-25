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
}

const Ctx = createContext<AppDataValue | null>(null);
const DEFAULT_SETTINGS: Settings = { theme: DEFAULT_THEME, unit: "kg", weightStep: 2, repStep: 1 };

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [active, setActive] = useState<Workout | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const loaded = useRef(false);

  // Hydrate once.
  useEffect(() => {
    (async () => {
      const [ex, ro, wo, ac, se] = await Promise.all([
        loadJSON(STORAGE_KEYS.exercises, DEFAULT_EXERCISES),
        loadJSON(STORAGE_KEYS.routines, DEFAULT_ROUTINES),
        loadJSON(STORAGE_KEYS.workouts, [] as Workout[]),
        loadJSON<Workout | null>(STORAGE_KEYS.active, null),
        loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
      ]);
      setExercises(ex);
      setRoutines(ro);
      setWorkouts(wo);
      setActive(ac);
      // Merge with defaults so settings saved by older versions gain new fields.
      setSettings({ ...DEFAULT_SETTINGS, ...se });
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
        const ex: Exercise = { id: uid(), name: name.trim(), group, equipment, weighted };
        setExercises((prev) => [...prev, ex]);
        return ex;
      },
      exerciseById,
      createRoutine: (name, exerciseIds) =>
        setRoutines((prev) => [...prev, { id: uid(), name: name.trim(), exerciseIds }]),
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
    };
  }, [ready, exercises, routines, workouts, active, settings, exerciseById, buildEntry]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
