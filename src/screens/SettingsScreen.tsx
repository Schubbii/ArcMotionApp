import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { THEMES } from "../theme/themes";
import { Card, ScreenTitle, SectionTitle } from "../components/ui";
import { CheckIcon } from "../components/Icons";

export function SettingsScreen() {
  const t = useTheme();
  const { settings, setTheme, setUnit, workouts } = useAppData();

  return (
    <View style={{ flex: 1 }}>
      <ScreenTitle title="Settings" sub="Make ArcMotion yours" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <SectionTitle>Color Theme</SectionTitle>
        <Text style={{ color: t.textMuted, fontSize: 13, marginHorizontal: 4, marginBottom: 12 }}>
          Choose a look — it instantly recolors the whole app.
        </Text>

        {THEMES.map((th) => {
          const active = settings.theme === th.id;
          return (
            <TouchableOpacity
              key={th.id}
              activeOpacity={0.85}
              onPress={() => setTheme(th.id)}
              style={[styles.themeCard, { backgroundColor: t.surface, borderColor: active ? t.primary : t.border }]}
            >
              <View style={[styles.preview, { backgroundColor: th.palette.bg, borderColor: t.border }]}>
                {th.swatches.slice(0, 3).map((c, i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", fontSize: 15, color: t.text }}>{th.name}</Text>
                <Text style={{ fontSize: 12.5, color: t.textMuted, marginTop: 2 }}>{th.description}</Text>
              </View>
              {active && (
                <View style={[styles.check, { backgroundColor: t.primary }]}>
                  <CheckIcon size={14} color={t.onPrimary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <SectionTitle>Units</SectionTitle>
        <Card>
          <View style={[styles.segment, { backgroundColor: t.surface2 }]}>
            {(["kg", "lb"] as const).map((u) => {
              const on = settings.unit === u;
              return (
                <TouchableOpacity
                  key={u}
                  style={[styles.segBtn, on && { backgroundColor: t.surface }]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={{ color: on ? t.text : t.textMuted, fontWeight: "700", fontSize: 13 }}>
                    {u === "kg" ? "Kilograms (kg)" : "Pounds (lb)"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card>
          <Text style={{ fontWeight: "800", color: t.text, fontSize: 15 }}>ArcMotion</Text>
          <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 4, lineHeight: 19 }}>
            A simple, modern workout tracker. {workouts.length} workout
            {workouts.length === 1 ? "" : "s"} logged. Your data is stored privately on this device.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  themeCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 2 },
  preview: { width: 52, height: 52, borderRadius: 13, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  dot: { width: 11, height: 11, borderRadius: 6 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
});
