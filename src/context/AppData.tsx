import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Exercise, SetEntry, Settings, ThemeId, WeightUnit } from "../types";
import { DEFAULT_EXERCISES } from "../data/defaultExercises";
import { DEFAULT_THEME } from "../data/themes";
import { load, save, STORAGE_KEYS } from "../lib/storage";
import { todayISO, uid } from "../lib/format";

interface AppDataValue {
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
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    load(STORAGE_KEYS.exercises, DEFAULT_EXERCISES)
  );
  const [sets, setSets] = useState<SetEntry[]>(() => load(STORAGE_KEYS.sets, []));
  const [settings, setSettings] = useState<Settings>(() =>
    load(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  );

  // Persist on change.
  useEffect(() => save(STORAGE_KEYS.exercises, exercises), [exercises]);
  useEffect(() => save(STORAGE_KEYS.sets, sets), [sets]);
  useEffect(() => save(STORAGE_KEYS.settings, settings), [settings]);

  // Reflect theme onto the document root so CSS variables apply globally.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const value = useMemo<AppDataValue>(
    () => ({
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
    [exercises, sets, settings]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
