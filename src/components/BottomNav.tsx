import type { ReactElement } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { DumbbellIcon, HistoryIcon, ChartIcon, SettingsIcon, BookIcon } from "./Icons";

export type Tab = "workout" | "library" | "history" | "progress" | "settings";

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
}

const ITEMS: { id: Tab; label: string; Icon: (p: { size?: number; color?: string }) => ReactElement }[] = [
  { id: "workout", label: "Workout", Icon: DumbbellIcon },
  { id: "library", label: "Library", Icon: BookIcon },
  { id: "history", label: "History", Icon: HistoryIcon },
  { id: "progress", label: "Progress", Icon: ChartIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

export function BottomNav({ active, onChange }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.nav,
        { backgroundColor: t.glassSurface, borderTopColor: t.glassBorder, paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      {ITEMS.map(({ id, label, Icon }) => {
        const on = active === id;
        const color = on ? t.primary : t.textMuted;
        return (
          <TouchableOpacity key={id} style={styles.item} onPress={() => onChange(id)} activeOpacity={0.7}>
            <Icon size={23} color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: "row", justifyContent: "space-around", paddingTop: 10, borderTopWidth: 1 },
  item: { flex: 1, alignItems: "center", gap: 3 },
  label: { fontSize: 11, fontWeight: "700" },
});
