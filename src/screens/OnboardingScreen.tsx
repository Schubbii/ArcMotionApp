import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "../context/AppData";
import { useTheme } from "../theme/ThemeContext";
import { ArcLogo } from "../components/ArcLogo";
import { PrimaryButton } from "../components/ui";

export function OnboardingScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { setName } = useAppData();
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) return;
    setName(value.trim());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.root, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.center}>
          <ArcLogo width={190} color={t.text} />
          <Text style={[styles.welcome, { color: t.text }]}>Welcome to ArcMotion</Text>
          <Text style={[styles.sub, { color: t.textMuted }]}>
            Let's get you set up. What should we call you?
          </Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Your name"
            placeholderTextColor={t.textMuted}
            style={[styles.input, { backgroundColor: t.surface, color: t.text, borderColor: t.border }]}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
            maxLength={40}
          />
        </View>

        <PrimaryButton
          title="Get Started"
          onPress={submit}
          style={{ opacity: value.trim() ? 1 : 0.5 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingTop: 24, justifyContent: "space-between" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 6 },
  welcome: { fontSize: 24, fontWeight: "900", marginTop: 24, textAlign: "center" },
  sub: { fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 21 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
});
