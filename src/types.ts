export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Cardio"
  | "Other";

export interface Exercise {
  id: string;
  name: string;
  group: MuscleGroup;
  /** Whether the exercise tracks weight. Bodyweight/cardio may not. */
  weighted: boolean;
}

export interface SetEntry {
  id: string;
  exerciseId: string;
  /** ISO date string (yyyy-mm-dd) the set was performed. */
  date: string;
  /** Unix ms timestamp for ordering. */
  ts: number;
  weight: number;
  reps: number;
}

export type ThemeId = "ocean" | "midnight" | "minimal" | "matcha";

export type WeightUnit = "kg" | "lb";

export interface Settings {
  theme: ThemeId;
  unit: WeightUnit;
}
