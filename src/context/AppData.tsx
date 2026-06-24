import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Exercise, SetEntry, Settings, ThemeId, WeightUnit } from "../types";
import { DEFAULT_EXERCISES } from "../data/defaultExercises";
import { DEFAULT_THEME } from "../theme/themes";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { todayISO, uid } from "../lib/format";

interface AppDataValue {
  ready: boolean;
  exercises: Exercise[];
  sets: SetEntry[];
  settings: Settings;
  addExercise: (name: string, group: Exercise["group"], weighted: boolean) => void;
  logSet: (exerciseId: string, weight: number, reps: number) => void;
  deleteSet: (id: string) => void;
  setsForExercise: (exerciseId: string) => SetEntry[];
  setTheme: (theme: ThemeId) => void;
  setUnit: (unit: WeightUnit) => void;
}

const Ctx = createContext<AppDataValue | null>(null);

const DEFAULT_SETTINGS: Settings = { theme: DEFAULT_THEME, unit: "kg" };

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const loaded = useRef(false);

  // Hydrate from AsyncStorage on first mount.
  useEffect(() => {
    (async () => {
      const [ex, st, se] = await Promise.all([
        loadJSON(STORAGE_KEYS.exercises, DEFAULT_EXERCISES),
        loadJSON(STORAGE_KEYS.sets, [] as SetEntry[]),
        loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
      ]);
      setExercises(ex);
      setSets(st);
      setSettings(se);
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  // Persist on change (only after the initial hydrate, to avoid clobbering).
  useEffect(() => {
    if (loaded.current) saveJSON(STORAGE_KEYS.exercises, exercises);
  }, [exercises]);
  useEffect(() => {
    if (loaded.current) saveJSON(STORAGE_KEYS.sets, sets);
  }, [sets]);
  useEffect(() => {
    if (loaded.current) saveJSON(STORAGE_KEYS.settings, settings);
  }, [settings]);

  const value = useMemo<AppDataValue>(
    () => ({
      ready,
      exercises,
      sets,
      settings,
      addExercise: (name, group, weighted) =>
        setExercises((prev) => [
          ...prev,
          { id: uid(), name: name.trim(), group, weighted },
        ]),
      logSet: (exerciseId, weight, reps) =>
        setSets((prev) => [
          ...prev,
          { id: uid(), exerciseId, date: todayISO(), ts: Date.now(), weight, reps },
        ]),
      deleteSet: (id) => setSets((prev) => prev.filter((s) => s.id !== id)),
      setsForExercise: (exerciseId) =>
        sets
          .filter((s) => s.exerciseId === exerciseId)
          .sort((a, b) => a.ts - b.ts),
      setTheme: (theme) => setSettings((prev) => ({ ...prev, theme })),
      setUnit: (unit) => setSettings((prev) => ({ ...prev, unit })),
    }),
    [ready, exercises, sets, settings]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
