import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <View style={[ui.card, { backgroundColor: t.surface }, style]}>{children}</View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <Text style={[ui.section, { color: t.textMuted }]}>{children}</Text>;
}

export function Empty({ emoji, text }: { emoji: string; text: string }) {
  const t = useTheme();
  return (
    <View style={ui.empty}>
      <Text style={ui.emoji}>{emoji}</Text>
      <Text style={[ui.emptyText, { color: t.textMuted }]}>{text}</Text>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <TouchableOpacity
      style={[ui.btn, { backgroundColor: t.primary }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[ui.btnText, { color: t.onPrimary }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <TouchableOpacity
      style={[ui.btn, { backgroundColor: t.surface2 }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[ui.btnText, { color: t.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export const ui = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  section: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: 18,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { textAlign: "center", fontSize: 14 },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 15, fontWeight: "700" },
});
