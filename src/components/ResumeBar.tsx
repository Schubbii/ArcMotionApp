import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { Glass } from "./Glass";
import { PressableScale } from "./motion";
import { ChevronRight } from "./Icons";
import { formatDuration } from "../lib/format";

/**
 * Mini-player style bar shown above the tab bar on every tab while a workout
 * is running, so an active session is never invisible (UX report F1).
 */
export function ResumeBar({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { active } = useAppData();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 68 }]}>
      <PressableScale onPress={onPress} scaleTo={0.97}>
        {/* Solid surface (not glassSurface): this is an actionable control, so
            content scrolling behind it must not bleed through. */}
        <Glass
          radius={16}
          style={{
            ...styles.inner,
            backgroundColor: t.surface,
            borderWidth: 1.5,
            borderColor: t.primary,
          }}
        >
          <View style={[styles.dot, { backgroundColor: t.primary }]} />
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
            {active.title}
          </Text>
          <Text style={[styles.timer, { color: t.primary }]}>
            {formatDuration(now - active.startTs)}
          </Text>
          <ChevronRight size={18} color={t.textMuted} />
        </Glass>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 14, right: 14 },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { flex: 1, fontWeight: "800", fontSize: 14 },
  timer: { fontWeight: "800", fontSize: 13, fontVariant: ["tabular-nums"] },
});
