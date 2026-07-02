import type { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { Glass } from "./Glass";

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <Glass style={[ui.card, style ?? {}]}>{children}</Glass>;
}

export function SectionTitle({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return <Text style={[ui.section, { color: t.textMuted }, style]}>{String(children).toUpperCase()}</Text>;
}

export function ScreenTitle({ title, sub }: { title: string; sub?: string }) {
  const t = useTheme();
  return (
    <View style={ui.screenHead}>
      <Text style={[ui.h1, { color: t.text }]}>{title}</Text>
      {sub ? <Text style={[ui.sub, { color: t.textMuted }]}>{sub}</Text> : null}
    </View>
  );
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

type BtnProps = { title: string; onPress: () => void; style?: ViewStyle; icon?: ReactNode };

export function PrimaryButton({ title, onPress, style, icon }: BtnProps) {
  const t = useTheme();
  return (
    <TouchableOpacity
      style={[ui.btn, { backgroundColor: t.primary }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
      <Text style={[ui.btnText, { color: t.onPrimary }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ title, onPress, style, icon }: BtnProps) {
  const t = useTheme();
  return (
    <TouchableOpacity
      style={[ui.btn, { backgroundColor: t.surface2 }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
      <Text style={[ui.btnText, { color: t.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        ui.pill,
        { backgroundColor: active ? t.primary : t.surface2, borderColor: active ? t.primary : t.border },
      ]}
    >
      <Text
        style={{
          color: active ? t.onPrimary : t.textMuted,
          fontWeight: "700",
          fontSize: 13,
          lineHeight: 16,
          includeFontPadding: false,
          textAlignVertical: "center",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export const ui = StyleSheet.create({
  card: { borderRadius: 18, padding: 16 },
  section: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, marginTop: 18, marginBottom: 10, marginHorizontal: 4 },
  screenHead: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  h1: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  sub: { fontSize: 13, marginTop: 2 },
  empty: { alignItems: "center", paddingVertical: 44, paddingHorizontal: 24 },
  emoji: { fontSize: 38, marginBottom: 12 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  btn: { flexDirection: "row", gap: 8, borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 15, fontWeight: "800" },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
