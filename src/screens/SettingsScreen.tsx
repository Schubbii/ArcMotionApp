import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { THEMES } from "../theme/themes";
import { Card, ScreenTitle, SectionTitle } from "../components/ui";
import { CheckIcon } from "../components/Icons";

export function SettingsScreen() {
  const t = useTheme();
  const { settings, setTheme, setUnit, setWeightStep, setRepStep, setName, workouts } = useAppData();

  return (
    <View style={{ flex: 1 }}>
      <ScreenTitle title="Settings" sub="Make ArcMotion yours" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <SectionTitle>Profile</SectionTitle>
        <Card>
          <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>
            Your name
          </Text>
          <TextInput
            value={settings.name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={t.textMuted}
            style={[styles.nameInput, { backgroundColor: t.surface2, color: t.text, borderColor: t.border }]}
            maxLength={40}
          />
        </Card>

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

        <SectionTitle>Increments</SectionTitle>
        <Text style={{ color: t.textMuted, fontSize: 13, marginHorizontal: 4, marginBottom: 12 }}>
          How much the +/- buttons change weight and reps while logging.
        </Text>
        <Card>
          <StepControl
            label={`Weight step (${settings.unit})`}
            value={settings.weightStep}
            step={0.5}
            decimals
            onChange={setWeightStep}
          />
          <View style={{ height: 14 }} />
          <StepControl label="Reps step" value={settings.repStep} step={1} onChange={setRepStep} />
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

function StepControl({
  label,
  value,
  step,
  decimals = false,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  decimals?: boolean;
  onChange: (n: number) => void;
}) {
  const t = useTheme();
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const display = decimals ? String(value) : String(Math.round(value));
  return (
    <View style={styles.stepRow}>
      <Text style={{ color: t.text, fontWeight: "700", fontSize: 15, flex: 1 }}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={[styles.stepBtn, { backgroundColor: t.surface2 }]}
          onPress={() => onChange(round2(value - step))}
        >
          <Text style={[styles.stepSign, { color: t.text }]}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.stepInput, { color: t.text, backgroundColor: t.surface2 }]}
          keyboardType="numeric"
          value={display}
          onChangeText={(txt) => {
            const n = parseFloat(txt.replace(",", "."));
            if (!Number.isNaN(n)) onChange(n);
          }}
          selectTextOnFocus
        />
        <TouchableOpacity
          style={[styles.stepBtn, { backgroundColor: t.surface2 }]}
          onPress={() => onChange(round2(value + step))}
        >
          <Text style={[styles.stepSign, { color: t.text }]}>+</Text>
        </TouchableOpacity>
      </View>
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
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepBtn: { width: 38, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  stepSign: { fontSize: 22, fontWeight: "600", lineHeight: 26 },
  stepInput: { width: 56, height: 40, borderRadius: 10, fontSize: 16, fontWeight: "800", textAlign: "center" },
  nameInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: "600" },
});
