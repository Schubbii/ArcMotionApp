import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import type { Palette } from "../theme/themes";
import { Card, Empty } from "../components/ui";
import { ChevronLeft, ChevronRight } from "../components/Icons";
import { todayISO } from "../lib/format";
import { calendarDays, monthGrid, monthLabel, shiftMonth, type MonthRef } from "../lib/calendar";

interface Props {
  onClose: () => void;
  onOpenWorkout: (id: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Muscle group → dot color, FitNotes-style category dots. */
function groupColor(group: string, t: Palette): string {
  switch (group) {
    case "Chest": return t.primary;
    case "Back": return t.accent;
    case "Legs": return t.success;
    case "Shoulders": return t.trophy;
    case "Arms": return t.danger;
    case "Core": return t.textMuted;
    case "Cardio": return t.accent;
    default: return t.textFaint;
  }
}

/** Month calendar of all logged workouts; tap a marked day to open it. */
export function CalendarScreen({ onClose, onOpenWorkout }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { workouts, exerciseById } = useAppData();

  const today = todayISO();
  const [ref, setRef] = useState<MonthRef>(() => {
    const [y, m] = today.split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const days = useMemo(
    () => calendarDays(workouts, (id) => exerciseById(id)?.group),
    [workouts, exerciseById]
  );
  const weeks = useMemo(() => monthGrid(ref.year, ref.month), [ref]);

  // Don't page endlessly into empty time: clamp between the oldest workout
  // (or this month) and today's month.
  const bounds = useMemo(() => {
    let min = today.slice(0, 7);
    for (const date of days.keys()) if (date.slice(0, 7) < min) min = date.slice(0, 7);
    return { min, max: today.slice(0, 7) };
  }, [days, today]);
  const refKey = `${ref.year}-${String(ref.month + 1).padStart(2, "0")}`;
  const canPrev = refKey > bounds.min;
  const canNext = refKey < bounds.max;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.head}>
        <TouchableOpacity onPress={onClose} hitSlop={8} style={{ padding: 4 }}>
          <ChevronLeft color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]}>Calendar</Text>
          <Text style={[styles.sub, { color: t.textMuted }]}>
            {days.size} training day{days.size === 1 ? "" : "s"} · {workouts.length} workouts
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <Card>
          <View style={styles.monthRow}>
            <TouchableOpacity
              onPress={() => canPrev && setRef((r) => shiftMonth(r, -1))}
              hitSlop={8}
              style={{ padding: 6, opacity: canPrev ? 1 : 0.25 }}
              disabled={!canPrev}
            >
              <ChevronLeft color={t.text} />
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: t.text }]}>{monthLabel(ref)}</Text>
            <TouchableOpacity
              onPress={() => canNext && setRef((r) => shiftMonth(r, 1))}
              hitSlop={8}
              style={{ padding: 6, opacity: canNext ? 1 : 0.25 }}
              disabled={!canNext}
            >
              <ChevronRight color={t.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={[styles.weekday, { color: t.textFaint }]}>{d}</Text>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((date, di) => {
                if (!date) return <View key={di} style={styles.cell} />;
                const info = days.get(date);
                const isToday = date === today;
                return (
                  <TouchableOpacity
                    key={di}
                    style={styles.cell}
                    disabled={!info}
                    onPress={() => info && onOpenWorkout(info.workoutId)}
                  >
                    <View
                      style={[
                        styles.dayBubble,
                        isToday && { backgroundColor: t.primary },
                        !isToday && info && { backgroundColor: t.primarySoft },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNum,
                          { color: isToday ? t.onPrimary : info ? t.text : t.textFaint },
                        ]}
                      >
                        {Number(date.slice(8))}
                      </Text>
                    </View>
                    <View style={styles.dots}>
                      {(info?.groups ?? []).map((g, gi) => (
                        <View key={gi} style={[styles.dot, { backgroundColor: groupColor(g, t) }]} />
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </Card>

        {days.size === 0 && (
          <Empty emoji="🗓️" text="No workouts yet — your training days will light up here." />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  title: { fontSize: 20, fontWeight: "900" },
  sub: { fontSize: 12.5, marginTop: 1 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  monthLabel: { fontSize: 16, fontWeight: "800" },
  weekRow: { flexDirection: "row", marginBottom: 2 },
  weekday: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "700", paddingVertical: 4 },
  cell: { flex: 1, alignItems: "center", paddingVertical: 4, minHeight: 46 },
  dayBubble: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  dayNum: { fontSize: 13.5, fontWeight: "700" },
  dots: { flexDirection: "row", gap: 3, height: 6, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
