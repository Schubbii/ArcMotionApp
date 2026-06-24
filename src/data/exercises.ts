import type { Exercise } from "../types";

/** Seed exercise library, loaded on first launch. Users can add their own. */
export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: "bench-bb", name: "Bench Press (Barbell)", group: "Chest", equipment: "Barbell", weighted: true },
  { id: "bench-db", name: "Bench Press (Dumbbell)", group: "Chest", equipment: "Dumbbell", weighted: true },
  { id: "incline-bb", name: "Incline Bench Press (Barbell)", group: "Chest", equipment: "Barbell", weighted: true },
  { id: "incline-db", name: "Incline Press (Dumbbell)", group: "Chest", equipment: "Dumbbell", weighted: true },
  { id: "chest-press-machine", name: "Chest Press (Machine)", group: "Chest", equipment: "Machine", weighted: true },
  { id: "cable-fly", name: "Cable Fly", group: "Chest", equipment: "Cable", weighted: true },
  { id: "pec-deck", name: "Pec Deck", group: "Chest", equipment: "Machine", weighted: true },
  { id: "pushup", name: "Push Up", group: "Chest", equipment: "Bodyweight", weighted: false },
  // Back
  { id: "deadlift", name: "Deadlift (Barbell)", group: "Back", equipment: "Barbell", weighted: true },
  { id: "row-bb", name: "Bent Over Row (Barbell)", group: "Back", equipment: "Barbell", weighted: true },
  { id: "row-db", name: "Row (Dumbbell)", group: "Back", equipment: "Dumbbell", weighted: true },
  { id: "lat-pulldown", name: "Lat Pulldown (Cable)", group: "Back", equipment: "Cable", weighted: true },
  { id: "seated-row", name: "Seated Cable Row", group: "Back", equipment: "Cable", weighted: true },
  { id: "pullup", name: "Pull Up", group: "Back", equipment: "Bodyweight", weighted: false },
  // Legs
  { id: "squat-bb", name: "Squat (Barbell)", group: "Legs", equipment: "Barbell", weighted: true },
  { id: "front-squat", name: "Front Squat (Barbell)", group: "Legs", equipment: "Barbell", weighted: true },
  { id: "leg-press", name: "Leg Press (Machine)", group: "Legs", equipment: "Machine", weighted: true },
  { id: "leg-ext", name: "Leg Extension (Machine)", group: "Legs", equipment: "Machine", weighted: true },
  { id: "leg-curl", name: "Leg Curl (Machine)", group: "Legs", equipment: "Machine", weighted: true },
  { id: "rdl", name: "Romanian Deadlift (Barbell)", group: "Legs", equipment: "Barbell", weighted: true },
  { id: "calf-raise", name: "Calf Raise", group: "Legs", equipment: "Machine", weighted: true },
  { id: "lunge", name: "Walking Lunge (Dumbbell)", group: "Legs", equipment: "Dumbbell", weighted: true },
  // Shoulders
  { id: "ohp", name: "Overhead Press (Barbell)", group: "Shoulders", equipment: "Barbell", weighted: true },
  { id: "arnold", name: "Arnold Press (Dumbbell)", group: "Shoulders", equipment: "Dumbbell", weighted: true },
  { id: "lateral-raise", name: "Lateral Raise (Dumbbell)", group: "Shoulders", equipment: "Dumbbell", weighted: true },
  { id: "face-pull", name: "Face Pull (Cable)", group: "Shoulders", equipment: "Cable", weighted: true },
  { id: "rear-delt", name: "Rear Delt Fly", group: "Shoulders", equipment: "Machine", weighted: true },
  // Arms
  { id: "curl-bb", name: "Barbell Curl", group: "Arms", equipment: "Barbell", weighted: true },
  { id: "curl-db", name: "Dumbbell Curl", group: "Arms", equipment: "Dumbbell", weighted: true },
  { id: "hammer-curl", name: "Hammer Curl (Dumbbell)", group: "Arms", equipment: "Dumbbell", weighted: true },
  { id: "tricep-pushdown", name: "Triceps Pushdown (Cable)", group: "Arms", equipment: "Cable", weighted: true },
  { id: "skullcrusher", name: "Skullcrusher (Barbell)", group: "Arms", equipment: "Barbell", weighted: true },
  { id: "dip", name: "Triceps Dip", group: "Arms", equipment: "Bodyweight", weighted: false },
  // Core
  { id: "plank", name: "Plank", group: "Core", equipment: "Bodyweight", weighted: false },
  { id: "cable-crunch", name: "Cable Crunch", group: "Core", equipment: "Cable", weighted: true },
  { id: "hanging-leg-raise", name: "Hanging Leg Raise", group: "Core", equipment: "Bodyweight", weighted: false },
  // Cardio
  { id: "treadmill", name: "Treadmill", group: "Cardio", equipment: "Machine", weighted: false },
  { id: "row-erg", name: "Rowing Machine", group: "Cardio", equipment: "Machine", weighted: false },
];

/** A couple of starter routines so the home screen isn't empty on first run. */
export const DEFAULT_ROUTINES = [
  {
    id: "routine-push",
    name: "Push Day",
    exerciseIds: ["bench-bb", "incline-db", "ohp", "lateral-raise", "tricep-pushdown"],
  },
  {
    id: "routine-pull",
    name: "Pull Day",
    exerciseIds: ["deadlift", "pullup", "row-bb", "seated-row", "curl-bb"],
  },
  {
    id: "routine-legs",
    name: "Leg Day",
    exerciseIds: ["squat-bb", "rdl", "leg-press", "leg-curl", "calf-raise"],
  },
];
