import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import type { Equipment, Exercise, MuscleGroup } from "../types";
import { CloseIcon, PlusIcon, SearchIcon } from "./Icons";
import { Pill } from "./ui";
import { PressableScale } from "./motion";

const GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"];
const EQUIPMENT: Equipment[] = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "Kettlebell", "Other"];

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (exerciseId: string) => void;
  /** Highlight already-selected exercises (for routine building). */
  selectedIds?: string[];
  /** Keep the sheet open after a pick (multi-select for routines). */
  multi?: boolean;
}

export function AddExerciseModal({ visible, onClose, onPick, selectedIds = [], multi = false }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { exercises, addExercise } = useAppData();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises
      .filter((e) => (group ? e.group === group : true))
      .filter((e) => (q ? e.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, query, group]);

  const handleCreated = (ex: Exercise) => {
    onPick(ex.id);
    setCreating(false);
    setQuery("");
    if (!multi) onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
        <View style={styles.head}>
          <TouchableOpacity
            onPress={() => (creating ? setCreating(false) : onClose())}
            hitSlop={8}
          >
            <Text style={[styles.cancel, { color: t.accent }, multi && !creating && { fontWeight: "800" }]}>
              {creating ? "Back" : multi ? "Done" : "Cancel"}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: t.text }]}>
            {creating ? "New Exercise" : "Add Exercise"}
          </Text>
          {creating ? (
            <View style={{ width: 48 }} />
          ) : (
            <TouchableOpacity onPress={() => setCreating(true)} hitSlop={8}>
              <Text style={[styles.cancel, { color: t.accent, fontWeight: "800" }]}>+ New</Text>
            </TouchableOpacity>
          )}
        </View>

        {creating ? (
          <CreateExerciseForm
            initialName={query.trim()}
            initialGroup={group}
            onCreate={(name, g, eq, weighted) => handleCreated(addExercise(name, g, eq, weighted))}
          />
        ) : (
          <>
            <View style={[styles.search, { backgroundColor: t.surface2, borderColor: t.border }]}>
              <SearchIcon size={18} color={t.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search exercise"
                placeholderTextColor={t.textMuted}
                style={[styles.searchInput, { color: t.text }]}
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
                  <CloseIcon size={18} color={t.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={styles.chipsBar}
            >
              <Pill label="All" active={group === null} onPress={() => setGroup(null)} />
              {GROUPS.map((g) => (
                <Pill key={g} label={g} active={group === g} onPress={() => setGroup(group === g ? null : g)} />
              ))}
            </ScrollView>

            <FlatList
              data={filtered}
              keyExtractor={(e) => e.id}
              contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <PressableScale
                  scaleTo={0.97}
                  style={[styles.createRow, { borderColor: t.border }]}
                  onPress={() => setCreating(true)}
                >
                  <PlusIcon size={20} color={t.primary} />
                  <Text style={{ color: t.text, fontWeight: "700" }}>
                    {query.trim() ? `Create "${query.trim()}"` : "Create a new exercise"}
                  </Text>
                </PressableScale>
              }
              renderItem={({ item }) => (
                <ExerciseRow
                  ex={item}
                  selected={selectedIds.includes(item.id)}
                  onPress={() => {
                    onPick(item.id);
                    if (!multi) onClose();
                  }}
                />
              )}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

/** Full create form: name, muscle group, equipment, weighted/bodyweight. */
function CreateExerciseForm({
  initialName,
  initialGroup,
  onCreate,
}: {
  initialName: string;
  initialGroup: MuscleGroup | null;
  onCreate: (name: string, group: MuscleGroup, equipment: Equipment, weighted: boolean) => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialName);
  const [group, setGroup] = useState<MuscleGroup>(initialGroup ?? "Chest");
  const [equipment, setEquipment] = useState<Equipment>("Barbell");
  const [weighted, setWeighted] = useState(true);
  const valid = name.trim().length > 0;

  const pickEquipment = (eq: Equipment) => {
    setEquipment(eq);
    // Bodyweight equipment implies an unweighted exercise by default.
    if (eq === "Bodyweight") setWeighted(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.fieldLabel, { color: t.textMuted }]}>NAME</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Incline Cable Fly"
        placeholderTextColor={t.textMuted}
        style={[styles.input, { backgroundColor: t.surface2, color: t.text, borderColor: t.border }]}
        autoFocus
        maxLength={60}
      />

      <Text style={[styles.fieldLabel, { color: t.textMuted }]}>MUSCLE GROUP</Text>
      <View style={styles.wrapChips}>
        {GROUPS.map((g) => (
          <Pill key={g} label={g} active={group === g} onPress={() => setGroup(g)} />
        ))}
      </View>

      <Text style={[styles.fieldLabel, { color: t.textMuted }]}>EQUIPMENT</Text>
      <View style={styles.wrapChips}>
        {EQUIPMENT.map((eq) => (
          <Pill key={eq} label={eq} active={equipment === eq} onPress={() => pickEquipment(eq)} />
        ))}
      </View>

      <Text style={[styles.fieldLabel, { color: t.textMuted }]}>TYPE</Text>
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

      <PressableScale
        style={[styles.createBtn, { backgroundColor: t.primary, opacity: valid ? 1 : 0.45 }]}
        disabled={!valid}
        onPress={() => valid && onCreate(name.trim(), group, equipment, weighted)}
      >
        <PlusIcon size={18} color={t.onPrimary} />
        <Text style={{ color: t.onPrimary, fontWeight: "800", fontSize: 15 }}>Create Exercise</Text>
      </PressableScale>
    </ScrollView>
  );
}

function ExerciseRow({ ex, selected, onPress }: { ex: Exercise; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <PressableScale
      scaleTo={0.97}
      onPress={onPress}
      style={[
        styles.row,
        { backgroundColor: selected ? t.primarySoft : t.surface, borderColor: selected ? t.primary : t.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: t.surface2 }]}>
        <Text style={{ color: t.textMuted, fontWeight: "800" }}>{ex.name.slice(0, 1)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: t.text }]}>{ex.name}</Text>
        <Text style={[styles.rowSub, { color: t.textMuted }]}>
          {ex.group} · {ex.equipment}
        </Text>
      </View>
      {selected && <Text style={{ color: t.primary, fontWeight: "900", fontSize: 18 }}>✓</Text>}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 17, fontWeight: "800" },
  cancel: { fontSize: 15, fontWeight: "600" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, paddingHorizontal: 12, height: 44, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  chips: { gap: 8, paddingHorizontal: 16, alignItems: "center" },
  chipsBar: { flexGrow: 0, height: 58 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontWeight: "700", fontSize: 15 },
  rowSub: { fontSize: 12.5, marginTop: 2 },
  createRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderStyle: "dashed" },
  fieldLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.6, marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15, fontWeight: "600" },
  wrapChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  createBtn: { flexDirection: "row", gap: 8, borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center", marginTop: 28 },
});
