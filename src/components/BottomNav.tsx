import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { CalendarIcon, ChartIcon, DumbbellIcon, SettingsIcon } from "./Icons";

export type Tab = "workout" | "history" | "stats" | "settings";

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
}

const ITEMS: {
  id: Tab;
  label: string;
  Icon: (p: { size?: number; color?: string }) => JSX.Element;
}[] = [
  { id: "workout", label: "Workout", Icon: DumbbellIcon },
  { id: "history", label: "History", Icon: CalendarIcon },
  { id: "stats", label: "Progress", Icon: ChartIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

export function BottomNav({ active, onChange }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.nav,
        {
          backgroundColor: t.surface,
          borderTopColor: t.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {ITEMS.map(({ id, label, Icon }) => {
        const on = active === id;
        const color = on ? t.primary : t.textMuted;
        return (
          <TouchableOpacity key={id} style={styles.item} onPress={() => onChange(id)}>
            <Icon size={24} color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  item: { flex: 1, alignItems: "center", gap: 3 },
  label: { fontSize: 11, fontWeight: "600" },
});
