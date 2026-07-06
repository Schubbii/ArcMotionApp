import { memo, useCallback, useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { showDialog } from "../lib/dialogs";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { NAV_CLEARANCE } from "../components/BottomNav";
import { Card, Empty, ScreenTitle } from "../components/ui";
import { CalendarIcon, ClockIcon, FlameIcon, TrashIcon } from "../components/Icons";
import { formatDateHeading, formatDuration } from "../lib/format";
import { workingSets, workoutVolume, workoutSetCount } from "../lib/stats";
import type { Workout } from "../types";

interface Props {
  onOpenWorkout: (id: string) => void;
  onOpenCalendar: () => void;
}

export function HistoryScreen({ onOpenWorkout, onOpenCalendar }: Props) {
  const t = useTheme();
  const { workouts, exercises, settings, deleteWorkout } = useAppData();
  const unit = settings.unit;

  // Id → name lookup once, instead of an O(n) find per rendered row.
  const nameById = useMemo(() => new Map(exercises.map((e) => [e.id, e.name])), [exercises]);

  const confirmDelete = useCallback(
    (id: string, title: string) =>
      showDialog("Delete workout?", `"${title}" will be removed from your history.`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteWorkout(id) },
      ]),
    [deleteWorkout]
  );

  return (
    <View style={{ flex: 1 }}>
      <ScreenTitle
        title="History"
        sub={`${workouts.length} workout${workouts.length === 1 ? "" : "s"}`}
        right={
          <TouchableOpacity
            onPress={onOpenCalendar}
            hitSlop={8}
            style={[styles.calBtn, { backgroundColor: t.surface2 }]}
          >
            <CalendarIcon size={20} color={t.text} />
          </TouchableOpacity>
        }
      />
      {/* Virtualized — imported histories can hold hundreds of workouts. */}
      <FlatList
        data={workouts}
        keyExtractor={(w) => w.id}
        renderItem={({ item }) => (
          <HistoryCard w={item} unit={unit} nameById={nameById} onDelete={confirmDelete} onOpen={onOpenWorkout} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: NAV_CLEARANCE }}
        ListEmptyComponent={
          <Empty emoji="🗓️" text="Finished workouts show up here. Start one from the Workout tab." />
        }
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

const HistoryCard = memo(function HistoryCard({
  w,
  unit,
  nameById,
  onDelete,
  onOpen,
}: {
  w: Workout;
  unit: string;
  nameById: Map<string, string>;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
}) {
  const t = useTheme();
  const setCount = workoutSetCount(w);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onOpen(w.id)}>
    <Card style={{ marginBottom: 12 }}>
      <View style={styles.cardTop}>
        <Text style={[styles.title, { color: t.text }]}>{w.title}</Text>
        <TouchableOpacity onPress={() => onDelete(w.id, w.title)} hitSlop={8}>
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
        <Text style={[styles.metaText, { color: t.textMuted }]}>{setCount} set{setCount === 1 ? "" : "s"}</Text>
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
              {sets.length} × {nameById.get(e.exerciseId) ?? "Exercise"}
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
    </TouchableOpacity>
  );
});

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
  calBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
