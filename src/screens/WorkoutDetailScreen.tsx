import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showDialog } from "../lib/dialogs";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { Card, Empty } from "../components/ui";
import { ChevronLeft, ChevronRight, ClockIcon, FlameIcon, TrashIcon } from "../components/Icons";
import { formatDateHeading, formatDuration } from "../lib/format";
import { workoutSetCount, workoutVolume } from "../lib/stats";

interface Props {
  workoutId: string;
  onClose: () => void;
  onOpenExercise: (id: string) => void;
}

/** Read-only detail of one logged workout: every exercise with every set. */
export function WorkoutDetailScreen({ workoutId, onClose, onOpenExercise }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { workouts, exerciseById, settings, deleteWorkout } = useAppData();
  const unit = settings.unit;

  const w = workouts.find((x) => x.id === workoutId);

  const confirmDelete = () => {
    if (!w) return;
    showDialog("Delete workout?", `"${w.title}" will be removed from your history.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteWorkout(w.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.head}>
        <TouchableOpacity onPress={onClose} hitSlop={8} style={{ padding: 4 }}>
          <ChevronLeft color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{w?.title ?? "Workout"}</Text>
          {w && <Text style={[styles.sub, { color: t.textMuted }]}>{formatDateHeading(w.date)}</Text>}
        </View>
        {w && (
          <TouchableOpacity onPress={confirmDelete} hitSlop={8} style={{ padding: 4 }}>
            <TrashIcon size={18} color={t.textFaint} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {!w ? (
          <Empty emoji="🗓️" text="This workout no longer exists." />
        ) : (
          <>
            <View style={styles.metaRow}>
              <View style={styles.meta}>
                <ClockIcon size={15} color={t.textMuted} />
                <Text style={[styles.metaText, { color: t.textMuted }]}>
                  {formatDuration((w.endTs ?? w.startTs) - w.startTs)}
                </Text>
              </View>
              <View style={styles.meta}>
                <FlameIcon size={15} color={t.textMuted} />
                <Text style={[styles.metaText, { color: t.textMuted }]}>
                  {workoutVolume(w).toLocaleString()} {unit}
                </Text>
              </View>
              <Text style={[styles.metaText, { color: t.textMuted }]}>{workoutSetCount(w)} sets</Text>
            </View>

            {w.entries.map((e) => {
              const ex = exerciseById(e.exerciseId);
              return (
                <Card key={e.id} style={{ marginBottom: 12 }}>
                  <TouchableOpacity style={styles.exHead} onPress={() => onOpenExercise(e.exerciseId)}>
                    <Text style={[styles.exName, { color: t.text }]} numberOfLines={1}>
                      {ex?.name ?? "Exercise"}
                    </Text>
                    <ChevronRight color={t.textFaint} />
                  </TouchableOpacity>
                  {e.note ? (
                    <Text style={[styles.note, { color: t.textMuted }]}>“{e.note}”</Text>
                  ) : null}
                  {e.sets.map((s, i) => (
                    <View
                      key={s.id}
                      style={[styles.setLine, i > 0 && { borderTopColor: t.border, borderTopWidth: 1 }]}
                    >
                      <Text style={[styles.setIdx, { color: s.warmup ? t.textFaint : t.textMuted }]}>
                        {s.warmup ? "W" : i + 1}
                      </Text>
                      <Text style={[styles.setVal, { color: t.text }]}>
                        {s.weight > 0 ? `${s.weight} ${unit} × ${s.reps}` : `${s.reps} reps`}
                      </Text>
                    </View>
                  ))}
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  title: { fontSize: 20, fontWeight: "900" },
  sub: { fontSize: 12.5, marginTop: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 14, paddingHorizontal: 4 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 13, fontWeight: "600" },
  exHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  exName: { fontSize: 15.5, fontWeight: "800", flex: 1 },
  note: { fontSize: 12.5, fontStyle: "italic", marginTop: 4 },
  setLine: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8, marginTop: 2 },
  setIdx: { width: 20, fontSize: 13, fontWeight: "800" },
  setVal: { fontSize: 14.5, fontWeight: "700" },
});
