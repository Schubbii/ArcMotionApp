import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  label: string;
  value: number;
  step: number;
  min?: number;
  onChange: (n: number) => void;
}

export function Stepper({ label, value, step, min = 0, onChange }: Props) {
  const t = useTheme();
  const clamp = (n: number) => Math.max(min, Math.round(n * 100) / 100);

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: t.textMuted }]}>{label.toUpperCase()}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: t.surface2 }]}
          onPress={() => onChange(clamp(value - step))}
        >
          <Text style={[styles.btnText, { color: t.text }]}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.value, { color: t.text }]}
          keyboardType="numeric"
          value={String(value)}
          selectTextOnFocus
          onChangeText={(txt) => {
            const n = parseFloat(txt.replace(",", "."));
            onChange(Number.isNaN(n) ? 0 : clamp(n));
          }}
        />
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: t.surface2 }]}
          onPress={() => onChange(clamp(value + step))}
        >
          <Text style={[styles.btnText, { color: t.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  btn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 28, fontWeight: "500", lineHeight: 32 },
  value: {
    flex: 1,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
    padding: 0,
  },
});
