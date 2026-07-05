import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
// The legacy API keeps the battle-tested string-path helpers (SDK 54 moved
// the default export to the new File/Directory classes).
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { backupFileName, serializeBackup, type AppSnapshot } from "./backup";
import type { FitNotesRaw } from "./fitnotes";
import { todayISO } from "./format";

/**
 * Device/file plumbing for backup export, backup restore and FitNotes import.
 * All functions resolve (never throw) so callers can branch on `ok`.
 */

export type TransferResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { value?: undefined } : { value: T }))
  | { ok: false; cancelled?: boolean; error: string };

const CANCELLED: TransferResult<never> = { ok: false, cancelled: true, error: "Cancelled." };

/** Write the backup JSON and hand it to the OS share sheet (web: download). */
export async function exportBackup(snapshot: AppSnapshot): Promise<TransferResult> {
  const json = serializeBackup(snapshot);
  const name = backupFileName(todayISO());
  try {
    if (Platform.OS === "web") {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      return { ok: true };
    }
    const uri = `${FileSystem.cacheDirectory}${name}`;
    await FileSystem.writeAsStringAsync(uri, json);
    if (!(await Sharing.isAvailableAsync())) {
      return { ok: false, error: "Sharing is not available on this device." };
    }
    await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Save ArcMotion backup" });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Export failed." };
  }
}

/** Let the user pick an ArcMotion backup file and return its raw JSON text. */
export async function pickBackupJson(): Promise<TransferResult<string>> {
  try {
    const res = await DocumentPicker.getDocumentAsync({
      // Android pickers often report .json as octet-stream, so accept anything
      // and let parseBackup() do the real validation.
      type: ["application/json", "application/octet-stream", "*/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled || !res.assets?.[0]) return CANCELLED;
    const asset = res.assets[0];
    if (Platform.OS === "web") {
      const text = asset.file ? await asset.file.text() : await (await fetch(asset.uri)).text();
      return { ok: true, value: text };
    }
    const text = await FileSystem.readAsStringAsync(asset.uri);
    return { ok: true, value: text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not read the file." };
  }
}

/**
 * Let the user pick a .fitnotes backup (a renamed SQLite database), then read
 * every table the import needs. Native only — expo-sqlite on web can't open a
 * picked file.
 */
export async function pickFitNotesData(): Promise<TransferResult<FitNotesRaw>> {
  if (Platform.OS === "web") {
    return { ok: false, error: "FitNotes import works in the mobile app only." };
  }
  const DB_NAME = "fitnotes-import.db";
  try {
    const res = await DocumentPicker.getDocumentAsync({
      type: "*/*", // .fitnotes has no registered mime type
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled || !res.assets?.[0]) return CANCELLED;

    // expo-sqlite opens by database name + directory, so stage the picked file
    // under a known name in the cache directory.
    const staged = `${FileSystem.cacheDirectory}${DB_NAME}`;
    await FileSystem.copyAsync({ from: res.assets[0].uri, to: staged });

    const SQLite = await import("expo-sqlite");
    const db = await SQLite.openDatabaseAsync(DB_NAME, undefined, FileSystem.cacheDirectory ?? undefined);
    try {
      const all = async <T>(sql: string): Promise<T[]> => {
        // Optional tables (comments, routines) may be missing in old backups.
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
      const raw: FitNotesRaw = {
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
      return { ok: true, value: raw };
    } finally {
      await db.closeAsync().catch(() => {});
      await FileSystem.deleteAsync(staged, { idempotent: true }).catch(() => {});
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    // A non-SQLite file makes openDatabaseAsync throw — translate that.
    return {
      ok: false,
      error: /database|sqlite|file is not/i.test(msg)
        ? "That file doesn't look like a FitNotes backup."
        : msg || "Import failed.",
    };
  }
}
