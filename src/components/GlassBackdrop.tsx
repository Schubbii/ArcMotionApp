import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

/**
 * Soft, theme-tinted gradient blobs rendered behind every screen. Together with
 * the translucent glassSurface cards this creates a subtle liquid-glass look
 * without any expensive real-time blur.
 */
export function GlassBackdrop() {
  const t = useTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="blobA" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={t.blobA} stopOpacity={t.blobOpacity} />
            <Stop offset="100%" stopColor={t.blobA} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="blobB" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={t.blobB} stopOpacity={t.blobOpacity * 0.85} />
            <Stop offset="100%" stopColor={t.blobB} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="12%" cy="5%" r="52%" fill="url(#blobA)" />
        <Circle cx="98%" cy="30%" r="46%" fill="url(#blobB)" />
        <Circle cx="30%" cy="60%" r="38%" fill="url(#blobB)" opacity={0.5} />
        <Circle cx="60%" cy="103%" r="50%" fill="url(#blobA)" opacity={0.8} />
      </Svg>
    </View>
  );
}
