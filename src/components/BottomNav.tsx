import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
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

/** Horizontal inset of the indicator capsule inside each tab slot. */
const PILL_INSET = 4;
/** How far the capsule extends beyond the icon+label block vertically. */
const PILL_VPAD = 3;

/**
 * Floating liquid-glass tab bar: a rounded pill with a real backdrop blur, so
 * content visibly frosts as it scrolls underneath — the Apple Liquid Glass cue.
 * The active tab is marked by a single indicator pill that glides between
 * tabs (spring physics) rather than a flat background instantly appearing.
 */
export function BottomNav({ active, onChange }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const activeIndex = ITEMS.findIndex((i) => i.id === active);

  const [layouts, setLayouts] = useState<
    Array<{ x: number; y: number; width: number; height: number } | undefined>
  >([]);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const measured = useRef(false);

  // All tabs are flex:1 and therefore equally wide, so only the X position
  // needs animating — width is set statically from the measured layout. This
  // keeps the whole animation on the native driver (width can't be
  // natively animated and would crash when mixed with a native transform).
  useEffect(() => {
    const l = layouts[activeIndex];
    if (!l) return;
    const toX = l.x + PILL_INSET;

    if (!measured.current || Platform.OS === "web") {
      // First measurement (and always on web, where the animated transform can
      // leave ghost artifacts): snap into place without animating.
      indicatorX.setValue(toX);
      measured.current = true;
      return;
    }
    Animated.spring(indicatorX, {
      toValue: toX,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [activeIndex, layouts, indicatorX]);

  const handleItemLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, y, width, height };
      return next;
    });
  };

  const activeLayout = layouts[activeIndex];

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <Glass blur radius={30}>
        <View style={styles.row}>
          {activeLayout && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                {
                  backgroundColor: t.primarySoft,
                  borderColor: t.primary,
                  shadowColor: t.primary,
                  // Capsule wraps the full icon+label block, derived from the
                  // measured tab layout so nothing can overflow it.
                  top: activeLayout.y - PILL_VPAD,
                  height: activeLayout.height + PILL_VPAD * 2,
                  borderRadius: (activeLayout.height + PILL_VPAD * 2) / 2,
                  width: activeLayout.width - PILL_INSET * 2,
                  transform: [{ translateX: indicatorX }],
                },
              ]}
            />
          )}
          {ITEMS.map(({ id, label, Icon }, index) => {
            const on = active === id;
            const color = on ? t.primary : t.textMuted;
            return (
              <PressableScale
                key={id}
                style={styles.item}
                scaleTo={0.88}
                onPress={() => onChange(id)}
                onLayout={handleItemLayout(index)}
              >
                <Icon size={22} color={color} />
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
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
  item: { flex: 1, alignItems: "center", gap: 3 },
  indicator: {
    position: "absolute",
    left: 0,
    borderWidth: 1,
    shadowOpacity: 0.25,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  label: { fontSize: 10.5, fontWeight: "700", lineHeight: 13, includeFontPadding: false },
});
