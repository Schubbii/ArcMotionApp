import { useMemo, useState } from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { showDialog } from "../lib/dialogs";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { NAV_CLEARANCE } from "../components/BottomNav";
import { PROGRAMS, PROGRAM_GOALS, type Program, type ProgramGoal } from "../data/programs";
import { Card, Pill, ScreenTitle } from "../components/ui";
import { PressableScale } from "../components/motion";
import { CheckIcon, PlusIcon } from "../components/Icons";

interface Props {
  onOpenActive: () => void;
}

export function LibraryScreen({ onOpenActive }: Props) {
  const t = useTheme();
  const { active, routines, startWorkoutWith, createRoutine } = useAppData();
  const [goal, setGoal] = useState<ProgramGoal | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const visible = useMemo(
    () => PROGRAMS.filter((p) => (goal ? p.goal === goal : true)),
    [goal]
  );

  const startProgram = (p: Program) => {
    const begin = () => {
      startWorkoutWith(p.name, p.exerciseIds);
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

  const saveProgram = (p: Program) => {
    if (savedIds.includes(p.id) || routines.some((r) => r.name === p.name)) return;
    createRoutine(p.name, p.exerciseIds);
    setSavedIds((prev) => [...prev, p.id]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenTitle title="Library" sub="Prebuilt workouts for every goal" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsBar}
        contentContainerStyle={styles.chips}
      >
        <Pill label="All" active={goal === null} onPress={() => setGoal(null)} />
        {PROGRAM_GOALS.map((g) => (
          <Pill key={g} label={g} active={goal === g} onPress={() => setGoal(goal === g ? null : g)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: NAV_CLEARANCE }}>
        {visible.map((p) => (
          <ProgramCard
            key={p.id}
            program={p}
            saved={savedIds.includes(p.id) || routines.some((r) => r.name === p.name)}
            onStart={() => startProgram(p)}
            onSave={() => saveProgram(p)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ProgramCard({
  program,
  saved,
  onStart,
  onSave,
}: {
  program: Program;
  saved: boolean;
  onStart: () => void;
  onSave: () => void;
}) {
  const t = useTheme();
  const { exerciseById } = useAppData();
  const names = program.exerciseIds
    .map((id) => exerciseById(id)?.name)
    .filter(Boolean)
    .join(" · ");

  return (
    <Card style={{ marginBottom: 14 }}>
      <View style={styles.cardTop}>
        <Text style={[styles.name, { color: t.text }]}>{program.name}</Text>
        {String(program.level) !== String(program.goal) && (
          <View style={[styles.levelBadge, { backgroundColor: t.primarySoft }]}>
            <Text style={{ color: t.text, fontWeight: "800", fontSize: 11 }}>{program.level}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.goalTag, { color: t.accent }]}>{program.goal.toUpperCase()}</Text>
      <Text style={[styles.desc, { color: t.textMuted }]}>{program.description}</Text>
      <Text style={[styles.exercises, { color: t.textFaint }]} numberOfLines={2}>
        {names}
      </Text>

      <View style={styles.btnRow}>
        <PressableScale
          style={[styles.btn, { backgroundColor: t.primary }]}
          onPress={onStart}
        >
          <Text style={{ color: t.onPrimary, fontWeight: "800", fontSize: 14 }}>Start Workout</Text>
        </PressableScale>
        <PressableScale
          style={[styles.btn, { backgroundColor: t.surface2, opacity: saved ? 0.7 : 1 }]}
          onPress={onSave}
          disabled={saved}
        >
          {saved ? <CheckIcon size={15} color={t.success} /> : <PlusIcon size={16} color={t.text} />}
          <Text style={{ color: saved ? t.success : t.text, fontWeight: "800", fontSize: 14 }}>
            {saved ? "Saved" : "Save Routine"}
          </Text>
        </PressableScale>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingHorizontal: 16, alignItems: "center" },
  chipsBar: { flexGrow: 0, height: 54 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  name: { fontSize: 18, fontWeight: "900", flex: 1 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  goalTag: { fontSize: 11, fontWeight: "900", letterSpacing: 1, marginTop: 4 },
  desc: { fontSize: 13.5, lineHeight: 19, marginTop: 8 },
  exercises: { fontSize: 12.5, lineHeight: 17, marginTop: 8 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
