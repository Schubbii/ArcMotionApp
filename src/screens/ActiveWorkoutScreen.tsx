import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import type { WorkoutSet } from "../types";
import { AddExerciseModal } from "../components/AddExerciseModal";
import { Glass } from "../components/Glass";
import { PressableScale } from "../components/motion";
import { CheckIcon, ChevronLeft, PlusIcon, TrashIcon } from "../components/Icons";
import { PrimaryButton } from "../components/ui";
import { formatDuration } from "../lib/format";
import { workingSets } from "../lib/stats";

interface Props {
  onClose: () => void;
}

export function ActiveWorkoutScreen({ onClose }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const {
    active,
    settings,
    exerciseById,
    setActiveTitle,
    addExerciseToActive,
    removeEntry,
    addSet,
    updateSet,
    toggleSetDone,
    toggleWarmup,
    removeSet,
    finishActive,
    discardActive,
  } = useAppData();

  const [now, setNow] = useState(Date.now());
  const [pickerOpen, setPickerOpen] = useState(false);

  // Live session timer.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!active) return null;
  const unit = settings.unit;

  let volume = 0;
  let setCount = 0;
  for (const e of active.entries) {
    for (const sset of workingSets(e.sets)) {
      volume += sset.weight * sset.reps;
      setCount += 1;
    }
  }

  const confirmFinish = () => {
    if (setCount === 0) {
      Alert.alert("Nothing logged", "Complete at least one set before finishing.");
      return;
    }
    Alert.alert("Finish workout?", "Your completed sets will be saved.", [
      { text: "Cancel", style: "cancel" },
      { text: "Finish", style: "default", onPress: () => { finishActive(); onClose(); } },
    ]);
  };

  const confirmDiscard = () => {
    Alert.alert("Discard workout?", "This workout will not be saved.", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => { discardActive(); onClose(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      {/* Header */}
      <View style={styles.head}>
        <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.headBtn}>
          <ChevronLeft color={t.text} />
        </TouchableOpacity>
        <TextInput
          value={active.title}
          onChangeText={setActiveTitle}
          style={[styles.titleInput, { color: t.text }]}
          placeholder="Workout"
          placeholderTextColor={t.textMuted}
        />
        <PressableScale onPress={confirmFinish} scaleTo={0.93} style={[styles.finish, { backgroundColor: t.primary }]}>
          <Text style={{ color: t.onPrimary, fontWeight: "800", fontSize: 14 }}>Finish</Text>
        </PressableScale>
      </View>

      {/* Stats bar */}
      <View style={[styles.stats, { borderColor: t.border }]}>
        <Stat label="Time" value={formatDuration(now - active.startTs)} color={t.primary} t={t} />
        <Stat label="Volume" value={`${Math.round(volume).toLocaleString()} ${unit}`} t={t} />
        <Stat label="Sets" value={String(setCount)} t={t} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        {active.entries.length === 0 ? (
          <Text style={{ color: t.textMuted, textAlign: "center", marginVertical: 32, lineHeight: 20 }}>
            Add an exercise to start logging your sets.
          </Text>
        ) : (
          <Text style={[styles.tip, { color: t.textFaint }]}>
            Tip: tap a set's number to mark it as warm-up (W) · long-press it to delete the set
          </Text>
        )}

        {active.entries.map((entry) => {
          const ex = exerciseById(entry.exerciseId);
          return (
            <Glass key={entry.id} style={styles.exCard}>
              <View style={styles.exHead}>
                <Text style={[styles.exName, { color: t.primary }]}>{ex?.name ?? "Exercise"}</Text>
                <TouchableOpacity onPress={() => removeEntry(entry.id)} hitSlop={8}>
                  <TrashIcon size={18} color={t.textFaint} />
                </TouchableOpacity>
              </View>

              {/* column headers */}
              <View style={styles.colHead}>
                <Text style={[styles.colSet, styles.colLabel, { color: t.textMuted }]}>SET</Text>
                <Text style={[styles.colGroup, styles.colLabel, styles.colLabelCenter, { color: t.textMuted }]}>
                  WEIGHT ({unit})
                </Text>
                <Text style={[styles.colGroup, styles.colLabel, styles.colLabelCenter, { color: t.textMuted }]}>
                  REPS
                </Text>
                <View style={styles.colCheck} />
              </View>

              {entry.sets.map((sset, i) => {
                const workingIndex =
                  entry.sets.slice(0, i + 1).filter((x) => !x.warmup).length;
                return (
                  <SetRow
                    key={sset.id}
                    set={sset}
                    label={sset.warmup ? "W" : String(workingIndex)}
                    weighted={ex?.weighted ?? true}
                    weightStep={settings.weightStep}
                    repStep={settings.repStep}
                    t={t}
                    onToggleWarmup={() => toggleWarmup(entry.id, sset.id)}
                    onChangeWeight={(weight) => updateSet(entry.id, sset.id, { weight })}
                    onChangeReps={(reps) => updateSet(entry.id, sset.id, { reps })}
                    onToggleDone={() => toggleSetDone(entry.id, sset.id)}
                    onRemove={() => removeSet(entry.id, sset.id)}
                  />
                );
              })}

              <PressableScale
                style={[styles.addSet, { backgroundColor: t.surface2 }]}
                onPress={() => addSet(entry.id)}
              >
                <PlusIcon size={16} color={t.text} />
                <Text style={{ color: t.text, fontWeight: "700", fontSize: 13 }}>Add Set</Text>
              </PressableScale>
            </Glass>
          );
        })}

        <PrimaryButton
          title="Add Exercise"
          icon={<PlusIcon size={20} color={t.onPrimary} />}
          onPress={() => setPickerOpen(true)}
          style={{ marginTop: 4 }}
        />
        <TouchableOpacity onPress={confirmDiscard} style={{ marginTop: 14, alignItems: "center" }}>
          <Text style={{ color: t.danger, fontWeight: "700" }}>Discard Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      <AddExerciseModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => addExerciseToActive(id)}
      />
    </View>
  );
}

function Stat({
  label,
  value,
  color,
  t,
}: {
  label: string;
  value: string;
  color?: string;
  t: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ color: color ?? t.text, fontSize: 18, fontWeight: "800", marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** A compact [−][value][+] stepper. The value stays editable for custom input. */
function StepField({
  value,
  step,
  editable,
  t,
  onChange,
}: {
  value: number;
  step: number;
  editable: boolean;
  t: ReturnType<typeof useTheme>;
  onChange: (n: number) => void;
}) {
  const parse = (txt: string) => {
    const n = parseFloat(txt.replace(",", "."));
    return Number.isNaN(n) ? 0 : n;
  };
  return (
    <View style={styles.stepField}>
      <PressableScale
        style={[styles.stepBtn, { backgroundColor: t.surface2 }]}
        onPress={() => editable && onChange(Math.max(0, round2(value - step)))}
        disabled={!editable}
        scaleTo={0.85}
        hitSlop={4}
      >
        <Text style={[styles.stepSign, { color: editable ? t.text : t.textFaint }]}>−</Text>
      </PressableScale>
      <TextInput
        style={[styles.stepInput, { color: editable ? t.text : t.textFaint, backgroundColor: t.surface2 }]}
        keyboardType="numeric"
        editable={editable}
        value={value === 0 ? "" : String(value)}
        onChangeText={(txt) => onChange(parse(txt))}
        placeholder="0"
        placeholderTextColor={t.textFaint}
        selectTextOnFocus
      />
      <PressableScale
        style={[styles.stepBtn, { backgroundColor: t.surface2 }]}
        onPress={() => editable && onChange(round2(value + step))}
        disabled={!editable}
        scaleTo={0.85}
        hitSlop={4}
      >
        <Text style={[styles.stepSign, { color: editable ? t.text : t.textFaint }]}>+</Text>
      </PressableScale>
    </View>
  );
}

function SetRow({
  set,
  label,
  weighted,
  weightStep,
  repStep,
  t,
  onToggleWarmup,
  onChangeWeight,
  onChangeReps,
  onToggleDone,
  onRemove,
}: {
  set: WorkoutSet;
  label: string;
  weighted: boolean;
  weightStep: number;
  repStep: number;
  t: ReturnType<typeof useTheme>;
  onToggleWarmup: () => void;
  onChangeWeight: (n: number) => void;
  onChangeReps: (n: number) => void;
  onToggleDone: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={[styles.setRow, set.done && { backgroundColor: t.rowDone }]}>
      <TouchableOpacity style={styles.colSet} onPress={onToggleWarmup} onLongPress={onRemove} hitSlop={6}>
        <Text style={{ color: set.warmup ? t.trophy : t.text, fontWeight: "800", fontSize: 15, textAlign: "center" }}>
          {label}
        </Text>
      </TouchableOpacity>

      <View style={styles.colGroup}>
        <StepField value={set.weight} step={weightStep} editable={weighted} t={t} onChange={onChangeWeight} />
      </View>
      <View style={styles.colGroup}>
        <StepField value={set.reps} step={repStep} editable t={t} onChange={onChangeReps} />
      </View>

      <PressableScale
        style={[styles.colCheck, styles.check, { backgroundColor: set.done ? t.success : t.surface2 }]}
        onPress={onToggleDone}
        scaleTo={0.8}
      >
        <CheckIcon size={15} color={set.done ? "#fff" : t.textFaint} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  headBtn: { padding: 4 },
  titleInput: { flex: 1, fontSize: 18, fontWeight: "800", paddingVertical: 4 },
  finish: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 11 },
  stats: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1 },
  exCard: { borderRadius: 16, padding: 14, marginBottom: 14 },
  tip: { fontSize: 11.5, textAlign: "center", marginBottom: 12, lineHeight: 16 },
  exHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  exName: { fontSize: 16, fontWeight: "800", flex: 1 },
  colHead: { flexDirection: "row", alignItems: "center", paddingBottom: 8 },
  colLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  colLabelCenter: { textAlign: "center" },
  setRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderRadius: 8, marginVertical: 1, gap: 6 },
  colSet: { width: 30, alignItems: "center" },
  colGroup: { flex: 1, paddingHorizontal: 2 },
  colCheck: { width: 38, alignItems: "center" },
  check: { height: 38, width: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  stepField: { flexDirection: "row", alignItems: "center", gap: 4 },
  stepBtn: { width: 30, height: 38, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  stepSign: { fontSize: 22, fontWeight: "600", lineHeight: 26 },
  stepInput: { flex: 1, height: 38, borderRadius: 9, fontSize: 15, fontWeight: "800", textAlign: "center", minWidth: 36, paddingHorizontal: 0 },
  addSet: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
});
