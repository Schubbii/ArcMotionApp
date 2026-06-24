import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../context/ThemeContext";
import type { SetEntry } from "../types";
import { Card, Empty, SectionTitle } from "../components/ui";
import { SetRow } from "../components/SetRow";
import { formatDateHeading } from "../lib/format";

export function HistoryScreen() {
  const t = useTheme();
  const { sets, exercises, settings } = useAppData();
  const unit = settings.unit;

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    exercises.forEach((e) => m.set(e.id, e.name));
    return m;
  }, [exercises]);

  const days = useMemo(() => {
    const byDate = new Map<string, Map<string, SetEntry[]>>();
    for (const s of sets) {
      const exMap = byDate.get(s.date) ?? new Map<string, SetEntry[]>();
      const arr = exMap.get(s.exerciseId) ?? [];
      arr.push(s);
      exMap.set(s.exerciseId, arr);
      byDate.set(s.date, exMap);
    }
    return [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [sets]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>History</Text>
        <Text style={[styles.sub, { color: t.textMuted }]}>
          {days.length} workout{days.length === 1 ? "" : "s"} logged
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {days.length === 0 ? (
          <Empty emoji="🗓️" text="Your logged workouts will appear here." />
        ) : (
          days.map(([date, exMap]) => (
            <View key={date}>
              <SectionTitle>{formatDateHeading(date).toUpperCase()}</SectionTitle>
              {[...exMap.entries()].map(([exId, exSets]) => (
                <Card key={exId} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "700", marginBottom: 4, color: t.text }}>
                    {nameById.get(exId) ?? "Exercise"}
                  </Text>
                  {exSets.map((s, i) => (
                    <SetRow
                      key={s.id}
                      set={s}
                      index={i + 1}
                      isBest={false}
                      unit={unit}
                      showBorder={false}
                    />
                  ))}
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 1 },
});
