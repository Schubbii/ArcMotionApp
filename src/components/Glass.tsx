import { useState, type ReactNode } from "react";
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

interface GlassProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Corner radius (also used for the specular edge). */
  radius?: number;
  /**
   * Render a real backdrop blur (Apple-style frosted glass). Expensive on
   * Android, so reserve it for floating chrome like the tab bar — regular
   * cards get the cheaper sheen-only treatment.
   */
  blur?: boolean;
  intensity?: number;
}

/**
 * Liquid-glass container: optional real blur, a translucent tint, a diagonal
 * light sheen, and a bright specular top edge — the three cues that make
 * Apple's Liquid Glass read as glass.
 */
export function Glass({ children, style, radius = 20, blur = false, intensity }: GlassProps) {
  const t = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });

  const flat = StyleSheet.flatten(style) ?? {};
  const r = typeof flat.borderRadius === "number" ? flat.borderRadius : radius;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - size.w) > 0.5 || Math.abs(height - size.h) > 0.5) {
      setSize({ w: width, h: height });
    }
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          borderRadius: r,
          overflow: "hidden",
          backgroundColor: blur ? "transparent" : t.glassSurface,
        },
        style,
      ]}
    >
      {blur && (
        <BlurView
          intensity={intensity ?? (t.dark ? 30 : 45)}
          tint={t.dark ? "dark" : "light"}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
      )}
      {blur && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.glassSurface }]} />
      )}

      {/* Sheen + specular edge overlay */}
      {size.w > 1 && size.h > 1 && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width={size.w} height={size.h}>
            <Defs>
              <LinearGradient id="sheen" x1="0" y1="0" x2="0.8" y2="1">
                <Stop offset="0" stopColor="#ffffff" stopOpacity={t.dark ? 0.09 : 0.45} />
                <Stop offset="0.4" stopColor="#ffffff" stopOpacity={t.dark ? 0.015 : 0.08} />
                <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#ffffff" stopOpacity={t.dark ? 0.45 : 0.95} />
                <Stop offset="0.45" stopColor="#ffffff" stopOpacity={t.dark ? 0.07 : 0.3} />
                <Stop offset="1" stopColor="#ffffff" stopOpacity={t.dark ? 0.14 : 0.65} />
              </LinearGradient>
            </Defs>
            {/* diagonal light sheen */}
            <Rect x="0" y="0" width={size.w} height={size.h} rx={r} fill="url(#sheen)" />
            {/* bright specular rim, brighter along the top */}
            <Rect
              x="0.75"
              y="0.75"
              width={size.w - 1.5}
              height={size.h - 1.5}
              rx={Math.max(0, r - 0.75)}
              fill="none"
              stroke="url(#edge)"
              strokeWidth="1.4"
            />
          </Svg>
        </View>
      )}

      {children}
    </View>
  );
}
