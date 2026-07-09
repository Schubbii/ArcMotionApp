import type { FitNotesRaw } from "./fitnotes";

/**
 * Native-only reader for a staged FitNotes SQLite database.
 *
 * This lives in its own module (with a `.web.ts` stub beside it) so that
 * `expo-sqlite` — whose web build imports a `.wasm` file the web bundler can't
 * package — never gets pulled into the web bundle. FitNotes import is a
 * native-only feature, so the web build simply doesn't need it.
 */
export async function readFitNotesDb(dbName: string, directory: string): Promise<FitNotesRaw> {
  const SQLite = await import("expo-sqlite");
  const db = await SQLite.openDatabaseAsync(dbName, undefined, directory);
  try {
    // Optional tables (comments, routines) may be missing in old backups.
    const all = async <T>(sql: string): Promise<T[]> => {
      try {
        return await db.getAllAsync<T>(sql);
      } catch {
        return [];
      }
    };
    const exercises = await db.getAllAsync<FitNotesRaw["exercises"][number]>(
      "SELECT _id, name, category_id, exercise_type_id FROM exercise"
    );
    const logs = await db.getAllAsync<FitNotesRaw["logs"][number]>(
      "SELECT _id, exercise_id, date, metric_weight, reps FROM training_log"
    );
    return {
      exercises,
      logs,
      categories: await all("SELECT _id, name FROM Category"),
      comments: await all("SELECT owner_id, comment FROM Comment WHERE owner_type_id = 1"),
      routines: await all("SELECT _id, name FROM Routine"),
      sections: await all("SELECT _id, routine_id, name, sort_order FROM RoutineSection"),
      sectionExercises: await all(
        "SELECT routine_section_id, exercise_id, sort_order FROM RoutineSectionExercise"
      ),
    };
  } finally {
    await db.closeAsync().catch(() => {});
  }
}
