/** Tiny typed wrapper around localStorage with JSON (de)serialization. */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export const STORAGE_KEYS = {
  exercises: "arcmotion.exercises",
  sets: "arcmotion.sets",
  settings: "arcmotion.settings",
} as const;
