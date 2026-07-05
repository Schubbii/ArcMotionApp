import AsyncStorage from "@react-native-async-storage/async-storage";

/** Typed async wrappers around AsyncStorage with JSON (de)serialization. */
export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export const STORAGE_KEYS = {
  exercises: "arcmotion.exercises",
  routines: "arcmotion.routines",
  workouts: "arcmotion.workouts",
  active: "arcmotion.active",
  settings: "arcmotion.settings",
  /** Safety snapshot taken right before an import/restore, for one-tap undo. */
  snapshot: "arcmotion.snapshot",
} as const;
