import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showDialog } from "../lib/dialogs";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { PROGRAMS } from "../data/programs";
import { Card, Empty, SectionTitle } from "../components/ui";
import { PressableScale } from "../components/motion";
import { ChevronLeft, CheckIcon, PlusIcon, TrashIcon } from "../components/Icons";
import type { PlanDay } from "../types";

interface Props {
  /** Exactly one of the two: a user plan (Library "My Plans") … */
  planId?: string;
  /** … or a prebuilt template program. */
  programId?: string;
  onClose: () => void;
  onOpenActive: () => void;
}

/**
 * Preview screen for a Library entry: shows every day with its exercises,
 * starts a session per day, deletes user plans, saves templates as routines.
 */
export function PlanDetailScreen({ planId, programId, onClose, onOpenActive }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { plans, routines, exerciseById, active, startWorkoutWith, createRoutine, deletePlan } =
    useAppData();

  const plan = planId ? plans.find((p) => p.id === planId) : undefined;
  const program = programId ? PROGRAMS.find((p) => p.id === programId) : undefined;

  // Templates are flat — show them as a single startable day.
  const days: PlanDay[] = useMemo(() => {
    if (plan) return plan.days;
    if (program) return [{ id: program.id, name: "Workout", exerciseIds: program.exerciseIds }];
    return [];
  }, [plan, program]);

  const name = plan?.name ?? program?.name ?? "Plan";
  const totalExercises = days.reduce((n, d) => n + d.exerciseIds.length, 0);
  const saved = !!program && routines.some((r) => r.name === program.name);

  const startDay = (day: PlanDay) => {
    // Plan days keep their own name as the session title, FitNotes-style.
    const title = program ? program.name : day.name;
    const begin = () => {
      startWorkoutWith(title, day.exerciseIds);
      onOpenActive();
    };
    if (active) {
      showDialog(
        "Workout in progress",
        "You already have a workout running. Starting a new one will replace it.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Resume Current", onPress: onOpenActive },
          { text: "Start New", style: "destructive", onPress: begin },
        ]
      );
    } else {
      begin();
    }
  };

  const confirmDelete = () => {
    if (!plan) return;
    showDialog("Delete plan?", `"${plan.name}" and its ${plan.days.length} days will be removed. Your logged workouts stay.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deletePlan(plan.id);
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
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{name}</Text>
          <Text style={[styles.sub, { color: t.textMuted }]}>
            {days.length} day{days.length === 1 ? "" : "s"} · {totalExercises} exercises
          </Text>
        </View>
        {plan && (
          <TouchableOpacity onPress={confirmDelete} hitSlop={8} style={{ padding: 4 }}>
            <TrashIcon size={18} color={t.textFaint} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {days.length === 0 ? (
          <Empty emoji="🗂️" text="This plan is empty or was deleted." />
        ) : (
          <>
            {program && (
              <Card style={{ marginBottom: 4 }}>
                <Text style={[styles.goalTag, { color: t.accent }]}>
                  {program.goal.toUpperCase()} · {program.level.toUpperCase()}
                </Text>
                <Text style={[styles.desc, { color: t.textMuted }]}>{program.description}</Text>
              </Card>
            )}

            {days.map((day) => (
              <View key={day.id}>
                <SectionTitle>{day.name}</SectionTitle>
                <Card>
                  {day.exerciseIds.map((exId, i) => {
                    const ex = exerciseById(exId);
                    return (
                      <View key={`${day.id}-${exId}-${i}`} style={[styles.exRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.border }]}>
                        <Text style={[styles.exName, { color: t.text }]} numberOfLines={1}>
                          {ex?.name ?? "Exercise"}
                        </Text>
                        <Text style={[styles.exMeta, { color: t.textFaint }]}>
                          {ex ? `${ex.group} · ${ex.equipment}` : ""}
                        </Text>
                      </View>
                    );
                  })}
                  <PressableScale style={[styles.startBtn, { backgroundColor: t.primary }]} onPress={() => startDay(day)}>
                    <Text style={{ color: t.onPrimary, fontWeight: "800", fontSize: 14 }}>
                      Start {program ? "Workout" : day.name}
                    </Text>
                  </PressableScale>
                </Card>
              </View>
            ))}

            {program && (
              <PressableScale
                style={[styles.saveBtn, { backgroundColor: t.surface2, opacity: saved ? 0.7 : 1 }]}
                onPress={() => {
                  if (!saved) createRoutine(program.name, program.exerciseIds);
                }}
                disabled={saved}
              >
                {saved ? <CheckIcon size={15} color={t.success} /> : <PlusIcon size={16} color={t.text} />}
                <Text style={{ color: saved ? t.success : t.text, fontWeight: "800", fontSize: 14 }}>
                  {saved ? "Saved to your routines" : "Save as routine"}
                </Text>
              </PressableScale>
            )}
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
  goalTag: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  desc: { fontSize: 13.5, lineHeight: 19, marginTop: 6 },
  exRow: { paddingVertical: 10 },
  exName: { fontSize: 14.5, fontWeight: "700" },
  exMeta: { fontSize: 12, marginTop: 1 },
  startBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  saveBtn: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
});
