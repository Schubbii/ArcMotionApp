import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { SetEntry } from "../types";
import { round } from "../lib/format";
import { TrophyIcon, TrashIcon } from "./Icons";

interface Props {
  set: SetEntry;
  index: number;
  isBest: boolean;
  unit: string;
  showBorder: boolean;
  onDelete?: (id: string) => void;
}

export function SetRow({ set, index, isBest, unit, showBorder, onDelete }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.row,
        showBorder && { borderTopWidth: 1, borderTopColor: t.border },
      ]}
    >
      <View
        style={[
          styles.idx,
          { backgroundColor: isBest ? t.trophy : t.surface2 },
        ]}
      >
        {isBest ? (
          <TrophyIcon size={14} color="#fff" />
        ) : (
          <Text style={{ color: t.textMuted, fontWeight: "700", fontSize: 13 }}>{index}</Text>
        )}
      </View>
      <View style={styles.main}>
        {set.weight > 0 && (
          <>
            <Text style={[styles.weight, { color: t.text }]}>{round(set.weight)}</Text>
            <Text style={[styles.muted, { color: t.textMuted }]}>{unit}</Text>
            <Text style={[styles.muted, { color: t.textMuted }]}>×</Text>
          </>
        )}
        <Text style={[styles.reps, { color: t.text }]}>{set.reps}</Text>
        <Text style={[styles.muted, { color: t.textMuted }]}>reps</Text>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(set.id)} hitSlop={8} style={{ padding: 4 }}>
          <TrashIcon size={18} color={t.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13 },
  idx: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  main: { flex: 1, flexDirection: "row", alignItems: "baseline", gap: 6 },
  weight: { fontSize: 18, fontWeight: "800" },
  reps: { fontSize: 18, fontWeight: "800" },
  muted: { fontSize: 13, fontWeight: "600" },
});
