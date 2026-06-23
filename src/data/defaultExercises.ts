import type { Exercise } from "../types";

/** Seed exercise library, loaded on first launch. Users can add their own. */
export const DEFAULT_EXERCISES: Exercise[] = [
  { id: "ex-bench", name: "Flat Barbell Bench Press", group: "Chest", weighted: true },
  { id: "ex-incline-db", name: "Incline Dumbbell Press", group: "Chest", weighted: true },
  { id: "ex-fly", name: "Cable Fly", group: "Chest", weighted: true },
  { id: "ex-deadlift", name: "Deadlift", group: "Back", weighted: true },
  { id: "ex-row", name: "Barbell Row", group: "Back", weighted: true },
  { id: "ex-pullup", name: "Pull Up", group: "Back", weighted: false },
  { id: "ex-squat", name: "Back Squat", group: "Legs", weighted: true },
  { id: "ex-legpress", name: "Leg Press", group: "Legs", weighted: true },
  { id: "ex-ohp", name: "Overhead Press", group: "Shoulders", weighted: true },
  { id: "ex-lateral", name: "Lateral Raise", group: "Shoulders", weighted: true },
  { id: "ex-curl", name: "Barbell Curl", group: "Arms", weighted: true },
  { id: "ex-tricep", name: "Triceps Pushdown", group: "Arms", weighted: true },
  { id: "ex-plank", name: "Plank", group: "Core", weighted: false },
];
