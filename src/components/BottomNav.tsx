import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { Glass } from "./Glass";
import { PressableScale } from "./motion";
import { DumbbellIcon, HistoryIcon, ChartIcon, SettingsIcon, BookIcon } from "./Icons";

export type Tab = "workout" | "library" | "history" | "progress" | "settings";

/** How much bottom padding scrolling screens need so content clears the bar. */
export const NAV_CLEARANCE = 118;

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

/**
 * Floating liquid-glass tab bar: a rounded pill with a real backdrop blur, so
 * content visibly frosts as it scrolls underneath — the Apple Liquid Glass cue.
 */
export function BottomNav({ active, onChange }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <Glass blur radius={30}>
        <View style={styles.row}>
          {ITEMS.map(({ id, label, Icon }) => {
            const on = active === id;
            const color = on ? t.primary : t.textMuted;
            return (
              <PressableScale
                key={id}
                style={styles.item}
                scaleTo={0.88}
                onPress={() => onChange(id)}
              >
                <View
                  style={[
                    styles.iconWrap,
                    on && { backgroundColor: t.primarySoft },
                  ]}
                >
                  <Icon size={22} color={color} />
                </View>
                <Text style={[styles.label, { color }]}>{label}</Text>
              </PressableScale>
            );
          })}
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 14, right: 14 },
  row: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4 },
  item: { flex: 1, alignItems: "center", gap: 1 },
  iconWrap: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: { fontSize: 10.5, fontWeight: "700" },
});
