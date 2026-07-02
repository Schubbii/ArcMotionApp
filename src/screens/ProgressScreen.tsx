import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { NAV_CLEARANCE } from "../components/BottomNav";
import { Card, Empty, ScreenTitle, SectionTitle } from "../components/ui";
import { Glass } from "../components/Glass";
import { ChevronRight, TrophyIcon } from "../components/Icons";
import { LineChart, type ChartPoint } from "../components/LineChart";
import { personalRecord, workoutVolume, workoutSetCount } from "../lib/stats";

interface Props {
  onOpenExercise: (id: string) => void;
}

export function ProgressScreen({ onOpenExercise }: Props) {
  const t = useTheme();
  const { workouts, exerciseById, settings } = useAppData();
  const unit = settings.unit;

  const totals = useMemo(() => {
    let volume = 0;
    let sets = 0;
    for (const w of workouts) {
      volume += workoutVolume(w);
      sets += workoutSetCount(w);
    }
    return { workouts: workouts.length, volume, sets };
  }, [workouts]);

  // Weekly volume trend (last 8 weeks).
  const volumePoints = useMemo<ChartPoint[]>(() => {
    if (workouts.length === 0) return [];
    const byWeek = new Map<string, number>();
    for (const w of workouts) {
      const d = new Date(w.date);
      const day = (d.getDay() + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - day);
      const key = monday.toISOString().slice(0, 10);
      byWeek.set(key, (byWeek.get(key) ?? 0) + workoutVolume(w));
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([k, v]) => ({ x: new Date(k).getTime(), y: v }));
  }, [workouts]);

  // Exercises with logged data, by frequency.
  const trained = useMemo(() => {
    const count = new Map<string, number>();
    for (const w of workouts) for (const e of w.entries) count.set(e.exerciseId, (count.get(e.exerciseId) ?? 0) + 1);
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, c]) => ({ id, sessions: c, pr: personalRecord(workouts, id) }));
  }, [workouts]);

  const tiles = [
    { value: String(totals.workouts), label: "Workouts" },
    { value: totals.volume.toLocaleString(), label: `Volume (${unit})` },
    { value: String(totals.sets), label: "Sets" },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScreenTitle title="Progress" sub="Spot trends & beat your records" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: NAV_CLEARANCE }}>
        {workouts.length === 0 ? (
          <Empty emoji="📈" text="Log a few workouts and your stats & graphs will appear here." />
        ) : (
          <>
            <View style={styles.tiles}>
              {tiles.map((tile) => (
                <Glass key={tile.label} style={styles.tile}>
                  <Text style={[styles.tileVal, { color: t.text }]}>{tile.value}</Text>
                  <Text style={[styles.tileLbl, { color: t.textMuted }]}>{tile.label}</Text>
                </Glass>
              ))}
            </View>

            <SectionTitle>Weekly Volume</SectionTitle>
            <Card>
              <LineChart points={volumePoints} height={180} />
            </Card>

            <SectionTitle>Exercises</SectionTitle>
            {trained.map(({ id, sessions, pr }) => (
              <TouchableOpacity key={id} activeOpacity={0.7} onPress={() => onOpenExercise(id)}>
                <Card style={{ ...styles.exCard }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exName, { color: t.text }]} numberOfLines={1}>
                      {exerciseById(id)?.name ?? "Exercise"}
                    </Text>
                    <Text style={[styles.exSub, { color: t.textMuted }]}>
                      {sessions} session{sessions === 1 ? "" : "s"}
                    </Text>
                  </View>
                  {pr > 0 && (
                    <View style={[styles.pr, { backgroundColor: t.primarySoft }]}>
                      <TrophyIcon size={13} color={t.trophy} />
                      <Text style={{ color: t.text, fontWeight: "800", fontSize: 12.5 }}>
                        {pr} {unit}
                      </Text>
                    </View>
                  )}
                  <ChevronRight color={t.textFaint} />
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, borderRadius: 16, padding: 14 },
  tileVal: { fontSize: 20, fontWeight: "900" },
  tileLbl: { fontSize: 11.5, fontWeight: "600", marginTop: 2 },
  exCard: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  exName: { fontSize: 15, fontWeight: "700" },
  exSub: { fontSize: 12.5, marginTop: 2 },
  pr: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
});
