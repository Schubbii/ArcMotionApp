import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppDataProvider, useAppData } from "./src/context/AppData";
import { ThemeContext } from "./src/context/ThemeContext";
import { paletteFor, THEMES } from "./src/theme/themes";
import { BottomNav, type Tab } from "./src/components/BottomNav";
import { WorkoutScreen } from "./src/screens/WorkoutScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { StatsScreen } from "./src/screens/StatsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ExerciseDetail } from "./src/screens/ExerciseDetail";
import type { Exercise } from "./src/types";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <Themed />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

function Themed() {
  const { settings, ready } = useAppData();
  const palette = paletteFor(settings.theme);
  const isDark = THEMES.find((t) => t.id === settings.theme)?.dark ?? false;

  return (
    <ThemeContext.Provider value={palette}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={["top"]}>
        {ready ? (
          <Shell />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.primary} size="large" />
          </View>
        )}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("workout");
  const [openExercise, setOpenExercise] = useState<Exercise | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {openExercise ? (
          <ExerciseDetail exercise={openExercise} onBack={() => setOpenExercise(null)} />
        ) : (
          <>
            {tab === "workout" && <WorkoutScreen onOpen={setOpenExercise} />}
            {tab === "history" && <HistoryScreen />}
            {tab === "stats" && <StatsScreen />}
            {tab === "settings" && <SettingsScreen />}
          </>
        )}
      </View>
      {!openExercise && <BottomNav active={tab} onChange={setTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
