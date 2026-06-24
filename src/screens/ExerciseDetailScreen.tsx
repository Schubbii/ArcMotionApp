import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import type { Metric } from "../types";
import { ChevronLeft, TrophyIcon } from "../components/Icons";
import { Card, Empty, Pill, SectionTitle } from "../components/ui";
import { LineChart, type ChartPoint } from "../components/LineChart";
import { formatDateHeading } from "../lib/format";
import {
  exerciseDayStats,
  METRIC_LABELS,
  metricValue,
  personalRecord,
  workingSets,
} from "../lib/stats";

interface Props {
  exerciseId: string;
  onClose: () => void;
}

const METRICS: Metric[] = ["heaviest", "1rm", "volume", "reps"];

export function ExerciseDetailScreen({ exerciseId, onClose }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { workouts, exerciseById, settings } = useAppData();
  const unit = settings.unit;
  const ex = exerciseById(exerciseId);

  const [metric, setMetric] = useState<Metric>("heaviest");

  const stats = useMemo(() => exerciseDayStats(workouts, exerciseId), [workouts, exerciseId]);
  const pr = personalRecord(workouts, exerciseId);

  const points = useMemo<ChartPoint[]>(
    () => stats.map((s) => ({ x: s.ts, y: metricValue(s, metric) })),
    [stats, metric]
  );

  // History: per workout, the sets for this exercise.
  const history = useMemo(
    () =>
      workouts
        .filter((w) => w.endTs && w.entries.some((e) => e.exerciseId === exerciseId))
        .map((w) => ({
          id: w.id,
          date: w.date,
          sets: w.entries.filter((e) => e.exerciseId === exerciseId).flatMap((e) => workingSets(e.sets)),
        })),
    [workouts, exerciseId]
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={styles.head}>
        <TouchableOpacity onPress={onClose} hitSlop={8} style={{ padding: 4 }}>
          <ChevronLeft color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{ex?.name ?? "Exercise"}</Text>
          <Text style={[styles.sub, { color: t.textMuted }]}>{ex ? `${ex.group} · ${ex.equipment}` : ""}</Text>
        </View>
        {pr > 0 && (
          <View style={[styles.prBadge, { backgroundColor: t.primarySoft }]}>
            <TrophyIcon size={14} color={t.trophy} />
            <Text style={{ color: t.text, fontWeight: "800", fontSize: 13 }}>{pr} {unit}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {stats.length === 0 ? (
          <Empty emoji="📊" text="No data yet. Log this exercise in a workout to see your progress." />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricRow}>
              {METRICS.map((m) => (
                <Pill key={m} label={METRIC_LABELS[m]} active={metric === m} onPress={() => setMetric(m)} />
              ))}
            </ScrollView>

            <Card>
              <Text style={[styles.metricTitle, { color: t.text }]}>{METRIC_LABELS[metric]}</Text>
              <LineChart points={points} height={200} markMax />
            </Card>

            <SectionTitle>History</SectionTitle>
            {history.map((h) => (
              <Card key={h.id} style={{ marginBottom: 12 }}>
                <Text style={[styles.histDate, { color: t.text }]}>{formatDateHeading(h.date)}</Text>
                {h.sets.map((s, i) => (
                  <View key={s.id} style={[styles.setLine, i > 0 && { borderTopColor: t.border, borderTopWidth: 1 }]}>
                    <Text style={[styles.setIdx, { color: t.textMuted }]}>{i + 1}</Text>
                    <Text style={[styles.setVal, { color: t.text }]}>
                      {s.weight > 0 ? `${s.weight} ${unit} × ${s.reps}` : `${s.reps} reps`}
                    </Text>
                  </View>
                ))}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  title: { fontSize: 18, fontWeight: "800" },
  sub: { fontSize: 12.5, marginTop: 1 },
  prBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 },
  metricRow: { gap: 8, paddingBottom: 12 },
  metricTitle: { fontSize: 15, fontWeight: "800", marginBottom: 6 },
  histDate: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  setLine: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 },
  setIdx: { width: 20, fontWeight: "700", fontSize: 13 },
  setVal: { fontSize: 15, fontWeight: "700" },
});
