import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppData } from "../context/AppData";
import { usePro } from "../context/ProContext";
import { useTheme } from "../theme/ThemeContext";
import { NAV_CLEARANCE } from "../components/BottomNav";
import { THEMES } from "../theme/themes";
import { Card, ScreenTitle, SectionTitle } from "../components/ui";
import { PressableScale } from "../components/motion";
import { CheckIcon, CrownIcon, LockIcon } from "../components/Icons";
import { showDialog } from "../lib/dialogs";
import { isThemeLocked } from "../lib/entitlements";
import { parseBackup } from "../lib/backup";
import { mapFitNotes } from "../lib/fitnotes";
import { exportBackup, pickBackupJson, pickFitNotesData } from "../lib/transfer";

export function SettingsScreen({ onOpenPaywall }: { onOpenPaywall: () => void }) {
  const t = useTheme();
  const {
    settings, setTheme, setUnit, setWeightStep, setRepStep, setName, workouts,
    exercises, exportSnapshot, restoreBackup, importFitNotes, undoTs, restoreLastSnapshot,
  } = useAppData();
  const { isPro, mode, restore, restoring, devMode, setDevMode, devToolsEnabled } = usePro();

  const onRestorePurchases = async () => {
    const res = await restore();
    showDialog(
      res.ok ? "Purchases restored" : "Nothing to restore",
      res.ok ? "Your Pro subscription is active again." : (res.error ?? "No previous purchase was found."),
    );
  };
  /** Which data action is running — rows disable while busy. */
  const [busy, setBusy] = useState<null | "export" | "restore" | "fitnotes" | "undo">(null);

  const onExport = async () => {
    setBusy("export");
    const res = await exportBackup(exportSnapshot());
    setBusy(null);
    if (!res.ok && !res.cancelled) showDialog("Export failed", res.error);
  };

  const onRestore = async () => {
    setBusy("restore");
    const picked = await pickBackupJson();
    setBusy(null);
    if (!picked.ok) {
      if (!picked.cancelled) showDialog("Restore failed", picked.error);
      return;
    }
    const parsed = parseBackup(picked.value);
    if (!parsed.ok) {
      showDialog("Restore failed", parsed.error);
      return;
    }
    const { data } = parsed;
    const when = parsed.exportedAt ? ` from ${parsed.exportedAt.slice(0, 10)}` : "";
    const planCount = (data.plans?.length ?? 0) + data.routines.filter((r) => r.id.startsWith("fn-rt-")).length;
    showDialog(
      "Restore backup?",
      `This backup${when} holds ${data.workouts.length} workouts, ${data.exercises.length} exercises and ${planCount} plans.\n\nIt will replace ALL current data (an active session is discarded). A safety snapshot is kept so you can undo.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: () => {
            restoreBackup(data);
            showDialog("Backup restored", "Your data has been replaced with the backup.");
          },
        },
      ]
    );
  };

  const onImportFitNotes = async () => {
    setBusy("fitnotes");
    const picked = await pickFitNotesData();
    setBusy(null);
    if (!picked.ok) {
      if (!picked.cancelled) showDialog("Import failed", picked.error);
      return;
    }
    const mapped = mapFitNotes(picked.value, exercises);
    const s = mapped.stats;
    if (s.workouts === 0 && s.plans === 0) {
      showDialog("Nothing to import", "No workouts or plans were found in that file.");
      return;
    }
    const skipped = s.skippedSets > 0 ? `\nSkipped: ${s.skippedSets} time/distance-only sets.` : "";
    showDialog(
      "Import FitNotes data?",
      `Found ${s.workouts} workouts (${s.sets} sets), ${s.newExercises} new exercises (${s.matchedExercises} matched existing) and ${s.plans} plans with ${s.planDays} days.${skipped}\n\nExisting ArcMotion data is kept; importing the same file again won't duplicate. A safety snapshot lets you undo.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            importFitNotes(mapped);
            showDialog(
              "Import complete",
              `${s.workouts} workouts are in your History and ${s.plans} plans are in the Library.`
            );
          },
        },
      ]
    );
  };

  const onUndo = () => {
    if (!undoTs) return;
    showDialog(
      "Undo last import/restore?",
      `This rolls everything back to ${new Date(undoTs).toLocaleString()}, right before the last import or restore.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Roll back",
          style: "destructive",
          onPress: async () => {
            setBusy("undo");
            const ok = await restoreLastSnapshot();
            setBusy(null);
            showDialog(ok ? "Rolled back" : "Undo failed", ok ? "Your previous data is back." : "The snapshot could not be loaded.");
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenTitle title="Settings" sub="Make ArcMotion yours" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: NAV_CLEARANCE }}>
        <SectionTitle>Profile</SectionTitle>
        <Card>
          <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>
            Your name
          </Text>
          <TextInput
            value={settings.name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={t.textMuted}
            style={[styles.nameInput, { backgroundColor: t.surface2, color: t.text, borderColor: t.border }]}
            maxLength={40}
          />
        </Card>

        <SectionTitle>ArcMotion Pro</SectionTitle>
        {isPro ? (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={[styles.crownBadge, { backgroundColor: t.primarySoft }]}>
                <CrownIcon size={20} color={t.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: "800", fontSize: 15 }}>Pro is active</Text>
                <Text style={{ color: t.textMuted, fontSize: 12.5, marginTop: 2, lineHeight: 17 }}>
                  All themes and the calendar overview are unlocked. Thanks for the support!
                </Text>
              </View>
            </View>
            {mode === "revenuecat" && (
              <TouchableOpacity onPress={onRestorePurchases} disabled={restoring} style={[styles.dataRow, { borderTopWidth: 1, borderTopColor: t.border, marginTop: 6 }]}>
                <Text style={{ color: t.textMuted, fontWeight: "700", fontSize: 14, flex: 1 }}>
                  {restoring ? "Restoring…" : "Restore purchases"}
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            )}
          </Card>
        ) : (
          <PressableScale scaleTo={0.98} onPress={onOpenPaywall} style={[styles.proCard, { backgroundColor: t.primarySoft, borderColor: t.primary }]}>
            <View style={[styles.crownBadge, { backgroundColor: t.primary }]}>
              <CrownIcon size={20} color={t.onPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontWeight: "900", fontSize: 16 }}>Go Pro</Text>
              <Text style={{ color: t.textMuted, fontSize: 12.5, marginTop: 2, lineHeight: 17 }}>
                Unlock every theme and the calendar overview. From €3.99/mo — free trial.
              </Text>
            </View>
            <Text style={{ color: t.primary, fontSize: 20, fontWeight: "700" }}>›</Text>
          </PressableScale>
        )}
        {!isPro && mode === "revenuecat" && (
          <TouchableOpacity onPress={onRestorePurchases} disabled={restoring} style={{ paddingVertical: 12, alignItems: "center" }}>
            <Text style={{ color: t.textMuted, fontWeight: "700", fontSize: 13.5 }}>
              {restoring ? "Restoring…" : "Restore purchases"}
            </Text>
          </TouchableOpacity>
        )}
        {devToolsEnabled && (
          <Card style={{ marginTop: 12 }}>
            <Text style={{ color: t.textMuted, fontSize: 12, fontWeight: "800", letterSpacing: 0.5, marginBottom: 10 }}>
              DEV · PREVIEW PRO STATE
            </Text>
            <View style={[styles.segment, { backgroundColor: t.surface2 }]}>
              {(["pro", "free", "live"] as const).map((m) => {
                const on = devMode === m;
                return (
                  <TouchableOpacity key={m} style={[styles.segBtn, on && { backgroundColor: t.surface }]} onPress={() => setDevMode(m)}>
                    <Text style={{ color: on ? t.text : t.textMuted, fontWeight: "700", fontSize: 12.5 }}>
                      {m === "pro" ? "Pro" : m === "free" ? "Free" : "Live"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{ color: t.textFaint, fontSize: 11.5, marginTop: 8, lineHeight: 16 }}>
              Only visible in development builds. "Live" uses the real (or mock) purchase.
            </Text>
          </Card>
        )}

        <SectionTitle>Color Theme</SectionTitle>
        <Text style={{ color: t.textMuted, fontSize: 13, marginHorizontal: 4, marginBottom: 12 }}>
          Choose a look — it instantly recolors the whole app.
        </Text>

        {THEMES.map((th) => {
          const active = settings.theme === th.id;
          const locked = isThemeLocked(th.id, isPro);
          return (
            <PressableScale
              key={th.id}
              scaleTo={0.97}
              onPress={() => (locked ? onOpenPaywall() : setTheme(th.id))}
              style={[styles.themeCard, { backgroundColor: t.glassSurface, borderColor: active ? t.primary : t.glassBorder }]}
            >
              <View style={[styles.preview, { backgroundColor: th.palette.bg, borderColor: t.border }, locked && { opacity: 0.6 }]}>
                {th.swatches.slice(0, 3).map((c, i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", fontSize: 15, color: t.text }}>{th.name}</Text>
                <Text style={{ fontSize: 12.5, color: t.textMuted, marginTop: 2 }}>{th.description}</Text>
              </View>
              {active ? (
                <View style={[styles.check, { backgroundColor: t.primary }]}>
                  <CheckIcon size={14} color={t.onPrimary} />
                </View>
              ) : locked ? (
                <View style={styles.lockWrap}>
                  <LockIcon size={15} color={t.textMuted} />
                </View>
              ) : null}
            </PressableScale>
          );
        })}

        <SectionTitle>Units</SectionTitle>
        <Card>
          <View style={[styles.segment, { backgroundColor: t.surface2 }]}>
            {(["kg", "lb"] as const).map((u) => {
              const on = settings.unit === u;
              return (
                <TouchableOpacity
                  key={u}
                  style={[styles.segBtn, on && { backgroundColor: t.surface }]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={{ color: on ? t.text : t.textMuted, fontWeight: "700", fontSize: 13 }}>
                    {u === "kg" ? "Kilograms (kg)" : "Pounds (lb)"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <SectionTitle>Increments</SectionTitle>
        <Text style={{ color: t.textMuted, fontSize: 13, marginHorizontal: 4, marginBottom: 12 }}>
          How much the +/- buttons change weight and reps while logging.
        </Text>
        <Card>
          <StepControl
            label={`Weight step (${settings.unit})`}
            value={settings.weightStep}
            step={0.5}
            decimals
            onChange={setWeightStep}
          />
          <View style={{ height: 14 }} />
          <StepControl label="Reps step" value={settings.repStep} step={1} onChange={setRepStep} />
        </Card>

        <SectionTitle>Data & Backup</SectionTitle>
        <Text style={{ color: t.textMuted, fontSize: 13, marginHorizontal: 4, marginBottom: 12 }}>
          Your data lives only on this device — export a backup now and then.
        </Text>
        <Card>
          <DataRow
            title={busy === "export" ? "Exporting…" : "Export backup"}
            sub="Save all workouts, routines & settings as a file"
            disabled={busy !== null}
            onPress={onExport}
          />
          <DataRow
            title={busy === "restore" ? "Opening…" : "Restore from backup"}
            sub="Replace current data with an ArcMotion backup file"
            disabled={busy !== null}
            onPress={onRestore}
            separated
          />
          <DataRow
            title={busy === "fitnotes" ? "Reading…" : "Import from FitNotes"}
            sub="Bring your history over from a .fitnotes backup"
            disabled={busy !== null}
            onPress={onImportFitNotes}
            separated
          />
          {undoTs !== null && (
            <DataRow
              title={busy === "undo" ? "Rolling back…" : "Undo last import/restore"}
              sub={`Back to the state from ${new Date(undoTs).toLocaleString()}`}
              disabled={busy !== null}
              onPress={onUndo}
              destructive
              separated
            />
          )}
        </Card>

        <SectionTitle>How It Works</SectionTitle>
        <Card>
          {[
            "Start a workout from the Workout tab, or pick a prebuilt plan in the Library.",
            "Log each set with the − / + buttons or type a custom number, then tap ✓ to complete it.",
            "Tap a set's number to mark it as a warm-up (W) — warm-ups don't count toward records.",
            "Long-press a set's number to delete that set.",
            "Sets prefill automatically from your last session of the same exercise.",
            "Finish saves only completed (✓) sets. Check Progress for records and trends.",
          ].map((tip, i) => (
            <View key={i} style={[styles.tipRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.border }]}>
              <Text style={{ color: t.primary, fontWeight: "900", width: 20 }}>{i + 1}</Text>
              <Text style={{ color: t.textMuted, fontSize: 13, lineHeight: 19, flex: 1 }}>{tip}</Text>
            </View>
          ))}
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card>
          <Text style={{ fontWeight: "800", color: t.text, fontSize: 15 }}>ArcMotion</Text>
          <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 4, lineHeight: 19 }}>
            A simple, modern workout tracker. {workouts.length} workout
            {workouts.length === 1 ? "" : "s"} logged. Your data is stored privately on this device.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

function DataRow({
  title,
  sub,
  onPress,
  disabled = false,
  destructive = false,
  separated = false,
}: {
  title: string;
  sub: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separated?: boolean;
}) {
  const t = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.dataRow, separated && { borderTopWidth: 1, borderTopColor: t.border }, disabled && { opacity: 0.5 }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: destructive ? t.danger : t.text, fontWeight: "700", fontSize: 15 }}>{title}</Text>
        <Text style={{ color: t.textMuted, fontSize: 12.5, marginTop: 2, lineHeight: 17 }}>{sub}</Text>
      </View>
      <Text style={{ color: t.textMuted, fontSize: 18, fontWeight: "600" }}>›</Text>
    </TouchableOpacity>
  );
}

function StepControl({
  label,
  value,
  step,
  decimals = false,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  decimals?: boolean;
  onChange: (n: number) => void;
}) {
  const t = useTheme();
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const display = decimals ? String(value) : String(Math.round(value));
  return (
    <View style={styles.stepRow}>
      <Text style={{ color: t.text, fontWeight: "700", fontSize: 15, flex: 1 }}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={[styles.stepBtn, { backgroundColor: t.surface2 }]}
          onPress={() => onChange(round2(value - step))}
        >
          <Text style={[styles.stepSign, { color: t.text }]}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.stepInput, { color: t.text, backgroundColor: t.surface2 }]}
          keyboardType="numeric"
          value={display}
          onChangeText={(txt) => {
            const n = parseFloat(txt.replace(",", "."));
            if (!Number.isNaN(n)) onChange(n);
          }}
          selectTextOnFocus
        />
        <TouchableOpacity
          style={[styles.stepBtn, { backgroundColor: t.surface2 }]}
          onPress={() => onChange(round2(value + step))}
        >
          <Text style={[styles.stepSign, { color: t.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  proCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1.5 },
  crownBadge: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  lockWrap: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  themeCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 2 },
  preview: { width: 52, height: 52, borderRadius: 13, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  dot: { width: 11, height: 11, borderRadius: 6 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepBtn: { width: 38, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  stepSign: { fontSize: 22, fontWeight: "600", lineHeight: 26 },
  stepInput: { width: 56, height: 40, borderRadius: 10, fontSize: 16, fontWeight: "800", textAlign: "center" },
  nameInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: "600" },
  tipRow: { flexDirection: "row", gap: 8, paddingVertical: 10 },
  dataRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
});
