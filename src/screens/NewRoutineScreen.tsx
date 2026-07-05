import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { AddExerciseModal } from "../components/AddExerciseModal";
import { ChevronLeft, PlusIcon, TrashIcon } from "../components/Icons";
import { PrimaryButton } from "../components/ui";

interface Props {
  onClose: () => void;
}

export function NewRoutineScreen({ onClose }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { exerciseById, createRoutine } = useAppData();
  const [name, setName] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hint, setHint] = useState(false);

  const save = () => {
    if (!name.trim() || ids.length === 0) {
      setHint(true);
      return;
    }
    createRoutine(name, ids);
    onClose();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.head}>
        <TouchableOpacity onPress={onClose} hitSlop={8} style={{ padding: 4 }}>
          <ChevronLeft color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: t.text }]}>New Routine</Text>
        <TouchableOpacity onPress={save} hitSlop={8}>
          <Text style={{ color: name.trim() && ids.length ? t.accent : t.textFaint, fontWeight: "800", fontSize: 15 }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {hint && (
          <Text style={{ color: t.danger, fontSize: 13, fontWeight: "600", marginBottom: 12 }}>
            Give the routine a name and add at least one exercise to save it.
          </Text>
        )}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Routine name (e.g. Push Day)"
          placeholderTextColor={t.textMuted}
          style={[styles.nameInput, { backgroundColor: t.surface, color: t.text, borderColor: t.border }]}
        />

        {ids.map((id) => (
          <View key={id} style={[styles.row, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={{ color: t.text, fontWeight: "700", flex: 1 }}>{exerciseById(id)?.name}</Text>
            <TouchableOpacity onPress={() => setIds((p) => p.filter((x) => x !== id))} hitSlop={8}>
              <TrashIcon size={17} color={t.textFaint} />
            </TouchableOpacity>
          </View>
        ))}

        <PrimaryButton
          title="Add Exercise"
          icon={<PlusIcon size={20} color={t.onPrimary} />}
          onPress={() => setPickerOpen(true)}
          style={{ marginTop: 8 }}
        />
      </ScrollView>

      <AddExerciseModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multi
        selectedIds={ids}
        onPick={(id) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10 },
  title: { fontSize: 17, fontWeight: "800" },
  nameInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, fontWeight: "700", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
});
