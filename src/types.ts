export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Cardio"
  | "Full Body";

export type Equipment =
  | "Barbell"
  | "Dumbbell"
  | "Machine"
  | "Cable"
  | "Bodyweight"
  | "Kettlebell"
  | "Other";

export interface Exercise {
  id: string;
  name: string;
  group: MuscleGroup;
  equipment: Equipment;
  /** Whether the exercise tracks external weight (false for pure bodyweight/cardio). */
  weighted: boolean;
}

/** A single set within an in-progress or completed workout. */
export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  done: boolean;
  /** Warmup sets are excluded from PRs and volume. */
  warmup: boolean;
}

/** One exercise's block within a workout, holding its sets. */
export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  note?: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  title: string;
  /** ISO date (yyyy-mm-dd) the workout was performed. */
  date: string;
  /** Unix ms timestamp when started. */
  startTs: number;
  /** Unix ms timestamp when finished (undefined while active). */
  endTs?: number;
  entries: WorkoutEntry[];
}

export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
}

export type ThemeId = "volt" | "ocean" | "carbon" | "matcha";

export type WeightUnit = "kg" | "lb";

export interface Settings {
  theme: ThemeId;
  unit: WeightUnit;
  /** Amount the +/- buttons add/subtract for weight and reps. */
  weightStep: number;
  repStep: number;
}

/** Progress-graph metrics, matching the Hevy analysis screen. */
export type Metric = "heaviest" | "1rm" | "volume" | "reps";
