import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises
      .filter((e) => (group ? e.group === group : true))
      .filter((e) => (q ? e.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, query, group]);

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    const ex = addExercise(name, group ?? "Full Body", "Other", true);
    onPick(ex.id);
    setQuery("");
    if (!multi) onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
        <View style={styles.head}>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Text style={[styles.cancel, { color: t.accent }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: t.text }]}>Add Exercise</Text>
          <TouchableOpacity onPress={handleCreate} hitSlop={8}>
            <Text style={[styles.cancel, { color: t.accent, fontWeight: "800" }]}>Create</Text>
          </TouchableOpacity>
        </View>

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
          style={{ flexGrow: 0 }}
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
            <TouchableOpacity
              style={[styles.createRow, { borderColor: t.border }]}
              onPress={handleCreate}
            >
              <PlusIcon size={20} color={t.primary} />
              <Text style={{ color: t.text, fontWeight: "700" }}>
                {query.trim() ? `Create "${query.trim()}"` : "Create a new exercise"}
              </Text>
            </TouchableOpacity>
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
      </View>
    </Modal>
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
  chips: { gap: 8, paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontWeight: "700", fontSize: 15 },
  rowSub: { fontSize: 12.5, marginTop: 2 },
  createRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderStyle: "dashed" },
});
