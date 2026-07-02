import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  Animated,
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

const PILL_TOP = 8;
const PILL_HEIGHT = 34;
const PILL_INSET = 6;

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

  const [layouts, setLayouts] = useState<Array<{ x: number; width: number } | undefined>>([]);
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

    if (!measured.current) {
      // First measurement: snap into place, don't slide in from the corner.
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
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
  };

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <Glass blur radius={30}>
        <View style={styles.row}>
          {layouts[activeIndex] && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                {
                  backgroundColor: t.primarySoft,
                  borderColor: t.primary,
                  shadowColor: t.primary,
                  width: (layouts[activeIndex]?.width ?? 0) - PILL_INSET * 2,
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
  item: { flex: 1, alignItems: "center", gap: 3 },
  indicator: {
    position: "absolute",
    top: PILL_TOP,
    left: 0,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    borderWidth: 1,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  label: { fontSize: 10.5, fontWeight: "700" },
});
