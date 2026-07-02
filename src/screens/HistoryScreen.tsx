import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { Card, Empty, ScreenTitle } from "../components/ui";
import { ClockIcon, FlameIcon, TrashIcon } from "../components/Icons";
import { formatDateHeading, formatDuration } from "../lib/format";
import { workingSets, workoutVolume, workoutSetCount } from "../lib/stats";

export function HistoryScreen() {
  const t = useTheme();
  const { workouts, exerciseById, settings, deleteWorkout } = useAppData();
  const unit = settings.unit;

  const confirmDelete = (id: string, title: string) =>
    Alert.alert("Delete workout?", `"${title}" will be removed from your history.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteWorkout(id) },
    ]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenTitle title="History" sub={`${workouts.length} workout${workouts.length === 1 ? "" : "s"}`} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {workouts.length === 0 ? (
          <Empty emoji="🗓️" text="Finished workouts show up here. Start one from the Workout tab." />
        ) : (
          workouts.map((w) => (
            <Card key={w.id} style={{ marginBottom: 12 }}>
              <View style={styles.cardTop}>
                <Text style={[styles.title, { color: t.text }]}>{w.title}</Text>
                <TouchableOpacity onPress={() => confirmDelete(w.id, w.title)} hitSlop={8}>
                  <TrashIcon size={17} color={t.textFaint} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.date, { color: t.textMuted }]}>{formatDateHeading(w.date)}</Text>

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

              <View style={[styles.divider, { backgroundColor: t.border }]} />

              {w.entries.map((e) => {
                const sets = workingSets(e.sets);
                const top = sets.reduce(
                  (best, s) => (s.weight * s.reps > best.weight * best.reps ? s : best),
                  sets[0]
                );
                return (
                  <View key={e.id} style={styles.exRow}>
                    <Text style={[styles.exName, { color: t.text }]} numberOfLines={1}>
                      {sets.length} × {exerciseById(e.exerciseId)?.name ?? "Exercise"}
                    </Text>
                    {top && top.weight > 0 && (
                      <Text style={[styles.exBest, { color: t.textMuted }]}>
                        {top.weight}{unit} × {top.reps}
                      </Text>
                    )}
                  </View>
                );
              })}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 18, fontWeight: "800", flex: 1 },
  date: { fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 13, fontWeight: "600" },
  divider: { height: 1, marginVertical: 12 },
  exRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  exName: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 10 },
  exBest: { fontSize: 13, fontWeight: "600" },
});
