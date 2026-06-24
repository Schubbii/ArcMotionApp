import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../context/ThemeContext";
import type { Exercise, SetEntry } from "../types";
import { Stepper } from "../components/Stepper";
import { SetRow } from "../components/SetRow";
import { LineChart, type ChartPoint } from "../components/LineChart";
import { ChevronLeft } from "../components/Icons";
import { Card, Empty, GhostButton, PrimaryButton, SectionTitle } from "../components/ui";
import {
  bestSetId,
  estimateOneRepMax,
  formatDateHeading,
  round,
  todayISO,
} from "../lib/format";

type TabId = "track" | "history" | "graph";

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

export function ExerciseDetail({ exercise, onBack }: Props) {
  const t = useTheme();
  const { settings, logSet, deleteSet, setsForExercise } = useAppData();
  const [tab, setTab] = useState<TabId>("track");
  const [weight, setWeight] = useState(exercise.weighted ? 20 : 0);
  const [reps, setReps] = useState(8);

  const unit = settings.unit;
  const allSets = setsForExercise(exercise.id);
  const todaySets = useMemo(
    () => allSets.filter((s) => s.date === todayISO()),
    [allSets]
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.back, { backgroundColor: t.surface }]}
          onPress={onBack}
        >
          <ChevronLeft size={22} color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={[styles.sub, { color: t.textMuted }]}>{exercise.group}</Text>
        </View>
      </View>

      <View style={[styles.tabs, { backgroundColor: t.surface2 }]}>
        {(["track", "history", "graph"] as TabId[]).map((id) => {
          const on = tab === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.tab, on && { backgroundColor: t.surface }]}
              onPress={() => setTab(id)}
            >
              <Text style={{ color: on ? t.text : t.textMuted, fontWeight: "700", fontSize: 13 }}>
                {id === "track" ? "Track" : id === "history" ? "History" : "Graph"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {tab === "track" && (
          <>
            <Card>
              {exercise.weighted && (
                <Stepper
                  label={`Weight (${unit})`}
                  value={weight}
                  step={2.5}
                  onChange={setWeight}
                />
              )}
              <Stepper label="Reps" value={reps} step={1} onChange={setReps} />
              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <PrimaryButton
                  title="Save Set"
                  style={{ flex: 1 }}
                  onPress={() => reps > 0 && logSet(exercise.id, weight, reps)}
                />
                <GhostButton
                  title="Clear"
                  style={{ flex: 1 }}
                  onPress={() => {
                    setWeight(exercise.weighted ? 20 : 0);
                    setReps(8);
                  }}
                />
              </View>
            </Card>

            <SectionTitle>TODAY</SectionTitle>
            {todaySets.length === 0 ? (
              <Empty emoji="💪" text="No sets yet — log your first one above." />
            ) : (
              <DaySets sets={todaySets} unit={unit} onDelete={deleteSet} />
            )}
          </>
        )}

        {tab === "history" && <HistoryTab sets={allSets} unit={unit} />}
        {tab === "graph" && <GraphTab sets={allSets} unit={unit} />}
      </ScrollView>
    </View>
  );
}

function DaySets({
  sets,
  unit,
  onDelete,
}: {
  sets: SetEntry[];
  unit: string;
  onDelete?: (id: string) => void;
}) {
  const best = bestSetId(sets);
  return (
    <Card>
      {sets.map((s, i) => (
        <SetRow
          key={s.id}
          set={s}
          index={i + 1}
          isBest={s.id === best}
          unit={unit}
          showBorder={i > 0}
          onDelete={onDelete}
        />
      ))}
    </Card>
  );
}

function HistoryTab({ sets, unit }: { sets: SetEntry[]; unit: string }) {
  const groups = useMemo(() => {
    const map = new Map<string, SetEntry[]>();
    for (const s of sets) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [sets]);

  if (sets.length === 0) {
    return <Empty emoji="📒" text="No history yet for this exercise." />;
  }

  return (
    <>
      {groups.map(([date, daySets]) => {
        const best = bestSetId(daySets);
        return (
          <View key={date}>
            <SectionTitle>{formatDateHeading(date).toUpperCase()}</SectionTitle>
            <Card>
              {daySets.map((s, i) => (
                <SetRow
                  key={s.id}
                  set={s}
                  index={i + 1}
                  isBest={s.id === best}
                  unit={unit}
                  showBorder={i > 0}
                />
              ))}
            </Card>
          </View>
        );
      })}
    </>
  );
}

function GraphTab({ sets, unit }: { sets: SetEntry[]; unit: string }) {
  const t = useTheme();
  const points = useMemo<ChartPoint[]>(() => {
    const byDay = new Map<string, number>();
    for (const s of sets) {
      const e = estimateOneRepMax(s.weight || s.reps, s.weight ? s.reps : 1);
      byDay.set(s.date, Math.max(byDay.get(s.date) ?? 0, e));
    }
    return [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ x: new Date(date).getTime(), y: round(v), label: date }));
  }, [sets]);

  if (points.length < 1) {
    return <Empty emoji="📈" text="Log a few sets to see your progress graph." />;
  }

  const latest = points[points.length - 1];
  const delta = round(latest.y - points[0].y);

  return (
    <>
      <SectionTitle>ESTIMATED 1 REP MAX</SectionTitle>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 6 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: t.text }}>{latest.y}</Text>
          <Text style={{ color: t.textMuted, fontWeight: "600", marginLeft: 6 }}>{unit}</Text>
          {points.length > 1 && (
            <Text
              style={{
                marginLeft: "auto",
                fontWeight: "700",
                color: delta >= 0 ? t.success : t.danger,
              }}
            >
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} {unit}
            </Text>
          )}
        </View>
        <LineChart points={points} />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  back: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 1 },
  tabs: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4, marginHorizontal: 16, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
});
