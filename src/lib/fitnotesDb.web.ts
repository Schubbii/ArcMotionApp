import type { FitNotesRaw } from "./fitnotes";

/**
 * Web stub — Metro resolves this instead of `fitnotesDb.ts` for the web
 * bundle, keeping `expo-sqlite` (and its unbundleable `.wasm`) out of it.
 * FitNotes import is native-only; callers already guard with Platform.OS.
 */
export async function readFitNotesDb(_dbName: string, _directory: string): Promise<FitNotesRaw> {
  throw new Error("FitNotes import is not available on web.");
}
