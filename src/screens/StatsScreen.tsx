import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../context/ThemeContext";
import { Card, Empty, SectionTitle } from "../components/ui";
import { LineChart, type ChartPoint } from "../components/LineChart";
import { round } from "../lib/format";

export function StatsScreen() {
  const t = useTheme();
  const { sets, exercises, settings } = useAppData();
  const unit = settings.unit;

  const stats = useMemo(() => {
    const days = new Set(sets.map((s) => s.date));
    const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    return {
      workouts: days.size,
      totalSets: sets.length,
      volume: Math.round(volume),
      exercisesTrained: new Set(sets.map((s) => s.exerciseId)).size,
    };
  }, [sets]);

  const volumePoints = useMemo<ChartPoint[]>(() => {
    if (sets.length === 0) return [];
    const byWeek = new Map<string, number>();
    for (const s of sets) {
      const d = new Date(s.date);
      const day = (d.getDay() + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - day);
      const key = monday.toISOString().slice(0, 10);
      byWeek.set(key, (byWeek.get(key) ?? 0) + s.weight * s.reps);
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([k, v]) => ({ x: new Date(k).getTime(), y: round(v), label: k }));
  }, [sets]);

  const topExercises = useMemo(() => {
    const count = new Map<string, number>();
    for (const s of sets) count.set(s.exerciseId, (count.get(s.exerciseId) ?? 0) + 1);
    const nameById = new Map(exercises.map((e) => [e.id, e.name]));
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, c]) => ({ name: nameById.get(id) ?? "Exercise", sets: c }));
  }, [sets, exercises]);

  const tiles = [
    { value: String(stats.workouts), label: "Workouts" },
    { value: String(stats.totalSets), label: "Total sets" },
    { value: `${stats.volume.toLocaleString()} ${unit}`, label: "Total volume" },
    { value: String(stats.exercisesTrained), label: "Exercises trained" },
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Progress</Text>
        <Text style={[styles.sub, { color: t.textMuted }]}>Spot trends & keep improving</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <Card key={tile.label} style={styles.tile}>
              <Text style={{ fontSize: 24, fontWeight: "800", color: t.text }}>{tile.value}</Text>
              <Text style={{ fontSize: 12, color: t.textMuted, fontWeight: "600", marginTop: 2 }}>
                {tile.label}
              </Text>
            </Card>
          ))}
        </View>

        <SectionTitle>WEEKLY VOLUME</SectionTitle>
        <Card>
          {volumePoints.length === 0 ? (
            <Empty emoji="📊" text="Log workouts to build your trend." />
          ) : (
            <LineChart points={volumePoints} height={180} />
          )}
        </Card>

        {topExercises.length > 0 && (
          <>
            <SectionTitle>MOST TRAINED</SectionTitle>
            <Card>
              {topExercises.map((e, i) => (
                <View
                  key={e.name}
                  style={[
                    styles.topRow,
                    i > 0 && { borderTopWidth: 1, borderTopColor: t.border },
                  ]}
                >
                  <Text style={{ flex: 1, fontWeight: "700", color: t.text }}>{e.name}</Text>
                  <Text style={{ fontWeight: "700", color: t.textMuted }}>{e.sets} sets</Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47.5%", flexGrow: 1 },
  topRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13 },
});
