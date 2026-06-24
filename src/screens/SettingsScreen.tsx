import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme/themes";
import { Card, SectionTitle } from "../components/ui";
import { CheckIcon } from "../components/Icons";

export function SettingsScreen() {
  const t = useTheme();
  const { settings, setTheme, setUnit } = useAppData();

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Settings</Text>
        <Text style={[styles.sub, { color: t.textMuted }]}>Make ArcMotion yours</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <SectionTitle>THEME</SectionTitle>
        <Text style={{ color: t.textMuted, fontSize: 13, marginHorizontal: 4, marginBottom: 12 }}>
          Pick a color theme — it instantly recolors the whole app.
        </Text>

        {THEMES.map((th) => {
          const active = settings.theme === th.id;
          return (
            <TouchableOpacity
              key={th.id}
              activeOpacity={0.8}
              onPress={() => setTheme(th.id)}
              style={[
                styles.themeCard,
                { backgroundColor: t.surface, borderColor: active ? t.primary : "transparent" },
              ]}
            >
              <View style={styles.swatches}>
                {th.swatches.map((c, i) => (
                  <View
                    key={i}
                    style={[
                      styles.swatch,
                      { backgroundColor: c, borderColor: t.surface, marginLeft: i === 0 ? 0 : -8 },
                    ]}
                  />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", fontSize: 15, color: t.text }}>{th.name}</Text>
                <Text style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
                  {th.description}
                </Text>
              </View>
              {active && (
                <View style={[styles.check, { backgroundColor: t.primary }]}>
                  <CheckIcon size={14} color={t.onPrimary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <SectionTitle>UNITS</SectionTitle>
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

        <SectionTitle>ABOUT</SectionTitle>
        <Card>
          <Text style={{ fontWeight: "700", color: t.text }}>ArcMotion</Text>
          <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>
            A simple, modern workout tracker. Your data is stored privately on this device.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 1 },
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  swatches: { flexDirection: "row" },
  swatch: { width: 26, height: 38, borderRadius: 8, borderWidth: 2 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
});
