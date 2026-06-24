import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../context/ThemeContext";
import type { Exercise, MuscleGroup } from "../types";
import { ChevronRight, PlusIcon } from "../components/Icons";
import { Empty, GhostButton, PrimaryButton } from "../components/ui";
import { shortDate } from "../lib/format";

const GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
  "Other",
];

interface Props {
  onOpen: (ex: Exercise) => void;
}

export function WorkoutScreen({ onOpen }: Props) {
  const t = useTheme();
  const { exercises, sets, addExercise } = useAppData();
  const [filter, setFilter] = useState<MuscleGroup | "All">("All");
  const [sheetOpen, setSheetOpen] = useState(false);

  const lastByEx = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sets) {
      const prev = map.get(s.exerciseId);
      if (!prev || s.date > prev) map.set(s.exerciseId, s.date);
    }
    return map;
  }, [sets]);

  const visible = exercises.filter((e) => filter === "All" || e.group === filter);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: t.primary }]}>
          <Text style={[styles.logoText, { color: t.onPrimary }]}>A</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]}>Workout</Text>
          <Text style={[styles.sub, { color: t.textMuted }]}>Pick an exercise to log</Text>
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: t.surface }]}
          onPress={() => setSheetOpen(true)}
        >
          <PlusIcon size={22} color={t.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      >
        {(["All", ...GROUPS] as const).map((g) => {
          const on = filter === g;
          return (
            <TouchableOpacity
              key={g}
              onPress={() => setFilter(g)}
              style={[
                styles.chip,
                { backgroundColor: on ? t.primary : t.surface },
              ]}
            >
              <Text style={{ color: on ? t.onPrimary : t.textMuted, fontWeight: "700", fontSize: 13 }}>
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {visible.length === 0 ? (
          <Empty emoji="🏋️" text="No exercises in this group yet." />
        ) : (
          visible.map((ex) => {
            const last = lastByEx.get(ex.id);
            return (
              <TouchableOpacity
                key={ex.id}
                activeOpacity={0.7}
                onPress={() => onOpen(ex)}
                style={[styles.row, { backgroundColor: t.surface }]}
              >
                <View style={[styles.avatar, { backgroundColor: t.primarySoft }]}>
                  <Text style={{ color: t.primary, fontWeight: "800", fontSize: 16 }}>
                    {ex.name.slice(0, 1)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: t.text }]}>{ex.name}</Text>
                  <Text style={[styles.rowSub, { color: t.textMuted }]}>
                    {ex.group}
                    {last ? ` · last ${shortDate(last)}` : " · not logged yet"}
                  </Text>
                </View>
                <ChevronRight size={20} color={t.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <AddExerciseModal
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={addExercise}
      />
    </View>
  );
}

function AddExerciseModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, group: MuscleGroup, weighted: boolean) => void;
}) {
  const t = useTheme();
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>("Chest");
  const [weighted, setWeighted] = useState(true);

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name, group, weighted);
    setName("");
    setGroup("Chest");
    setWeighted(true);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: t.surface }]}>
          <Text style={[styles.sheetTitle, { color: t.text }]}>New Exercise</Text>

          <Text style={[styles.fieldLabel, { color: t.textMuted }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Incline Cable Fly"
            placeholderTextColor={t.textMuted}
            style={[styles.input, { backgroundColor: t.surface2, color: t.text, borderColor: t.border }]}
          />

          <Text style={[styles.fieldLabel, { color: t.textMuted }]}>Muscle group</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            style={{ marginBottom: 14 }}
          >
            {GROUPS.map((g) => {
              const on = group === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGroup(g)}
                  style={[styles.chip, { backgroundColor: on ? t.primary : t.surface2 }]}
                >
                  <Text style={{ color: on ? t.onPrimary : t.textMuted, fontWeight: "700", fontSize: 13 }}>
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.fieldLabel, { color: t.textMuted }]}>Type</Text>
          <View style={[styles.segment, { backgroundColor: t.surface2 }]}>
            {[
              { k: true, label: "Weighted" },
              { k: false, label: "Bodyweight" },
            ].map(({ k, label }) => {
              const on = weighted === k;
              return (
                <TouchableOpacity
                  key={label}
                  style={[styles.segBtn, on && { backgroundColor: t.surface }]}
                  onPress={() => setWeighted(k)}
                >
                  <Text style={{ color: on ? t.text : t.textMuted, fontWeight: "700", fontSize: 13 }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <GhostButton title="Cancel" onPress={onClose} style={{ flex: 1 }} />
            <PrimaryButton title="Add" onPress={submit} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoText: { fontWeight: "800", fontSize: 20 },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  chipsRow: { flexGrow: 0, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontWeight: "700", fontSize: 15 },
  rowSub: { fontSize: 13, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34 },
  sheetTitle: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15, marginBottom: 14 },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
});
