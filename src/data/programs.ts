/**
 * Prebuilt workout programs shown in the Library tab. Every exerciseId must
 * exist in DEFAULT_EXERCISES (validated by scripts/check-programs at build
 * time in CI-less fashion: see repo history).
 */
export type ProgramGoal =
  | "Beginner"
  | "Strength"
  | "Muscle"
  | "Fat Loss"
  | "Home"
  | "Athletic";

export type ProgramLevel = "Beginner" | "Intermediate" | "Advanced" | "All Levels";

export interface Program {
  id: string;
  name: string;
  goal: ProgramGoal;
  level: ProgramLevel;
  /** Short guidance: sets/reps scheme and who it's for. */
  description: string;
  exerciseIds: string[];
}

export const PROGRAM_GOALS: ProgramGoal[] = [
  "Beginner",
  "Strength",
  "Muscle",
  "Fat Loss",
  "Home",
  "Athletic",
];

export const PROGRAMS: Program[] = [
  // ----------------------------- Beginner ----------------------------
  {
    id: "full-body-starter",
    name: "Full Body Starter",
    goal: "Beginner",
    level: "Beginner",
    description:
      "The perfect first program: one exercise per body part, 3 sets of 8–12 reps, 2–3× per week. Focus on clean, controlled form.",
    exerciseIds: ["goblet-squat", "chest-press-machine", "lat-pulldown", "leg-curl", "machine-shoulder-press", "plank"],
  },
  {
    id: "machine-circuit",
    name: "Machine Circuit",
    goal: "Beginner",
    level: "Beginner",
    description:
      "Machines only — great when the free-weight area feels intimidating. 2–3 rounds of 12–15 reps, short rests.",
    exerciseIds: ["chest-press-machine", "seated-row", "leg-press", "machine-shoulder-press", "leg-ext", "machine-crunch"],
  },

  // ----------------------------- Strength ----------------------------
  {
    id: "strength-a",
    name: "Strength Day A · 5×5",
    goal: "Strength",
    level: "Intermediate",
    description:
      "Classic heavy compounds: 5 sets of 5 reps, rest ~3 minutes. Alternate with Day B, add a little weight each session.",
    exerciseIds: ["squat-bb", "bench-bb", "row-bb"],
  },
  {
    id: "strength-b",
    name: "Strength Day B · 5×5",
    goal: "Strength",
    level: "Intermediate",
    description:
      "The other half of the 5×5: squat and press 5×5, then one heavy set of 5 deadlifts. Quality over quantity.",
    exerciseIds: ["squat-bb", "ohp", "deadlift"],
  },

  // ------------------------------ Muscle -----------------------------
  {
    id: "push-pro",
    name: "Push Day",
    goal: "Muscle",
    level: "Intermediate",
    description:
      "Chest, shoulders & triceps. 3–4 sets of 6–12 reps; push the last set close to failure.",
    exerciseIds: ["bench-bb", "incline-db", "db-shoulder-press", "lateral-raise", "cable-fly", "tricep-pushdown"],
  },
  {
    id: "pull-pro",
    name: "Pull Day",
    goal: "Muscle",
    level: "Intermediate",
    description:
      "Back & biceps. Start heavy with deadlifts, then rows and pulldowns, finish with curls. 3–4 sets each.",
    exerciseIds: ["deadlift", "lat-pulldown", "seated-row", "face-pull", "curl-bb", "hammer-curl"],
  },
  {
    id: "legs-pro",
    name: "Leg Day",
    goal: "Muscle",
    level: "Intermediate",
    description:
      "Quads, hamstrings, glutes & calves. Squat first while fresh; 3–4 sets of 8–12 reps.",
    exerciseIds: ["squat-bb", "rdl", "leg-press", "leg-curl", "leg-ext", "calf-raise"],
  },
  {
    id: "upper-day",
    name: "Upper Body",
    goal: "Muscle",
    level: "Beginner",
    description:
      "Half of the Upper/Lower split — a time-efficient classic. 3 sets of 8–12 reps, 3–4× per week alternating.",
    exerciseIds: ["bench-bb", "row-bb", "ohp", "lat-pulldown", "curl-db", "tricep-pushdown"],
  },
  {
    id: "lower-day",
    name: "Lower Body",
    goal: "Muscle",
    level: "Beginner",
    description:
      "The lower half of the Upper/Lower split: legs plus core to finish. 3 sets of 8–12 reps.",
    exerciseIds: ["squat-bb", "rdl", "leg-press", "leg-curl", "calf-raise", "cable-crunch"],
  },

  // ----------------------------- Fat Loss ----------------------------
  {
    id: "hiit-burner",
    name: "HIIT Burner",
    goal: "Fat Loss",
    level: "All Levels",
    description:
      "Max-effort intervals: 40s work / 20s rest per exercise, 3–4 rounds. Log rounds as sets. Short, brutal, effective.",
    exerciseIds: ["burpee", "kb-swing", "mountain-climbers", "jump-rope", "row-erg"],
  },
  {
    id: "full-body-burn",
    name: "Full Body Burn",
    goal: "Fat Loss",
    level: "All Levels",
    description:
      "Light weights, high reps, minimal rest: 3 rounds of 15 reps each. Keeps the heart rate up while training everything.",
    exerciseIds: ["thruster", "goblet-squat", "pushup", "kb-swing", "russian-twist", "plank"],
  },

  // ------------------------------- Home ------------------------------
  {
    id: "bw-basics",
    name: "Bodyweight Basics",
    goal: "Home",
    level: "Beginner",
    description:
      "Zero equipment, anywhere. 3 sets per exercise, stop 2 reps before failure. Perfect for home or travel.",
    exerciseIds: ["air-squat", "pushup", "air-lunge", "glute-bridge", "plank", "mountain-climbers"],
  },
  {
    id: "bw-advanced",
    name: "Bodyweight Advanced",
    goal: "Home",
    level: "Advanced",
    description:
      "Calisthenics strength: hard bodyweight moves, 3–5 sets of quality reps. A pull-up bar is all you need.",
    exerciseIds: ["pullup", "dip", "pistol-squat", "diamond-pushup", "hanging-leg-raise", "burpee"],
  },

  // ----------------------------- Athletic ----------------------------
  {
    id: "explosive-power",
    name: "Explosive Power",
    goal: "Athletic",
    level: "Advanced",
    description:
      "Speed & power for sport: 3–5 explosive reps per set with full recovery between sets. Never train these to failure.",
    exerciseIds: ["power-clean", "box-jump", "push-press", "kb-swing", "sprints"],
  },
  {
    id: "core-stability",
    name: "Core & Stability",
    goal: "Athletic",
    level: "All Levels",
    description:
      "Bulletproof your trunk: anti-rotation and carries. 3 rounds, 30–60s holds or 8–10 controlled reps.",
    exerciseIds: ["plank", "side-plank", "dead-bug", "ab-wheel", "turkish-getup", "farmers-carry"],
  },
];
