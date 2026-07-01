import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, SectionTitle } from "../components/ui";
import { ArcLogo } from "../components/ArcLogo";
import { PlusIcon, ChevronRight, ClockIcon, FlameIcon, TrashIcon } from "../components/Icons";
import { formatDuration, greeting } from "../lib/format";
import { workoutVolume, workoutSetCount } from "../lib/stats";

interface Props {
  onOpenActive: () => void;
  onNewRoutine: () => void;
}

export function WorkoutHomeScreen({ onOpenActive, onNewRoutine }: Props) {
  const t = useTheme();
  const { active, routines, workouts, settings, exerciseById, startEmptyWorkout, startRoutine, deleteRoutine } =
    useAppData();

  const start = (fn: () => void) => {
    fn();
    onOpenActive();
  };

  const lastWorkout = workouts[0];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <View style={{ marginBottom: 8, alignItems: "center" }}>
        <Text style={[styles.greet, { color: t.text, alignSelf: "flex-start" }]}>
          {greeting()}
          {settings.name ? (
            <Text>, <Text style={{ color: t.primary }}>{settings.name}</Text></Text>
          ) : null}
        </Text>
        <ArcLogo width={170} color={t.text} />
        <Text style={[styles.wordmark, { color: t.textMuted }]}>ARCMOTION</Text>
      </View>

      {active && (
        <TouchableOpacity activeOpacity={0.9} onPress={onOpenActive}>
          <Card style={{ ...styles.resume, borderColor: t.primary }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resumeLabel, { color: t.primary }]}>WORKOUT IN PROGRESS</Text>
              <Text style={[styles.resumeTitle, { color: t.text }]}>{active.title}</Text>
              <Text style={[styles.resumeSub, { color: t.textMuted }]}>
                {active.entries.length} exercise{active.entries.length === 1 ? "" : "s"} · tap to resume
              </Text>
            </View>
            <ChevronRight color={t.primary} />
          </Card>
        </TouchableOpacity>
      )}

      <SectionTitle>Quick Start</SectionTitle>
      <PrimaryButton
        title="Start Empty Workout"
        icon={<PlusIcon size={20} color={t.onPrimary} />}
        onPress={() => start(startEmptyWorkout)}
      />

      <View style={styles.routineHead}>
        <SectionTitle style={{ marginTop: 22 }}>Routines</SectionTitle>
        <TouchableOpacity style={styles.newRoutine} onPress={onNewRoutine} hitSlop={8}>
          <PlusIcon size={18} color={t.accent} />
          <Text style={{ color: t.accent, fontWeight: "700", fontSize: 13 }}>New</Text>
        </TouchableOpacity>
      </View>

      {routines.length === 0 ? (
        <Card>
          <Text style={{ color: t.textMuted }}>No routines yet. Create one to start faster.</Text>
        </Card>
      ) : (
        routines.map((r) => {
          const names = r.exerciseIds
            .map((id) => exerciseById(id)?.name)
            .filter(Boolean)
            .join(", ");
          return (
            <Card key={r.id} style={{ marginBottom: 12 }}>
              <View style={styles.routineTop}>
                <Text style={[styles.routineTitle, { color: t.text }]}>{r.name}</Text>
                <TouchableOpacity onPress={() => deleteRoutine(r.id)} hitSlop={8}>
                  <TrashIcon size={17} color={t.textFaint} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.routineEx, { color: t.textMuted }]} numberOfLines={2}>
                {names || "No exercises"}
              </Text>
              <PrimaryButton title="Start Routine" onPress={() => start(() => startRoutine(r.id))} style={{ marginTop: 12 }} />
            </Card>
          );
        })
      )}

      {lastWorkout && (
        <>
          <SectionTitle style={{ marginTop: 22 }}>Last Workout</SectionTitle>
          <Card>
            <Text style={[styles.routineTitle, { color: t.text }]}>{lastWorkout.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.meta}>
                <ClockIcon size={15} color={t.textMuted} />
                <Text style={[styles.metaText, { color: t.textMuted }]}>
                  {formatDuration((lastWorkout.endTs ?? lastWorkout.startTs) - lastWorkout.startTs)}
                </Text>
              </View>
              <View style={styles.meta}>
                <FlameIcon size={15} color={t.textMuted} />
                <Text style={[styles.metaText, { color: t.textMuted }]}>
                  {workoutVolume(lastWorkout).toLocaleString()} vol
                </Text>
              </View>
              <Text style={[styles.metaText, { color: t.textMuted }]}>
                {workoutSetCount(lastWorkout)} sets
              </Text>
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  greet: { fontSize: 17, fontWeight: "800", marginBottom: 4 },
  wordmark: { fontSize: 14, fontWeight: "900", letterSpacing: 3, marginTop: 2 },
  resume: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, marginTop: 14 },
  resumeLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  resumeTitle: { fontSize: 18, fontWeight: "800", marginTop: 3 },
  resumeSub: { fontSize: 13, marginTop: 2 },
  routineHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  newRoutine: { flexDirection: "row", alignItems: "center", gap: 4, marginRight: 4 },
  routineTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  routineTitle: { fontSize: 17, fontWeight: "800" },
  routineEx: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 13, fontWeight: "600" },
});
