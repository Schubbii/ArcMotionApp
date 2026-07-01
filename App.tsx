import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, BackHandler, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppDataProvider, useAppData } from "./src/context/AppData";
import { ThemeContext } from "./src/theme/ThemeContext";
import { paletteFor } from "./src/theme/themes";
import { BottomNav, type Tab } from "./src/components/BottomNav";
import { WorkoutHomeScreen } from "./src/screens/WorkoutHomeScreen";
import { ActiveWorkoutScreen } from "./src/screens/ActiveWorkoutScreen";
import { NewRoutineScreen } from "./src/screens/NewRoutineScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { ExerciseDetailScreen } from "./src/screens/ExerciseDetailScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <Themed />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

/** Full-screen routes pushed over the tab bar. */
type Route =
  | { name: "tabs" }
  | { name: "active" }
  | { name: "newRoutine" }
  | { name: "exercise"; id: string };

function Themed() {
  const { settings, ready } = useAppData();
  const palette = paletteFor(settings.theme);

  return (
    <ThemeContext.Provider value={palette}>
      <StatusBar style={palette.dark ? "light" : "dark"} />
      <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={["top"]}>
        {!ready ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.primary} size="large" />
          </View>
        ) : settings.name.trim() === "" ? (
          <OnboardingScreen />
        ) : (
          <Router />
        )}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

function Router() {
  const [tab, setTab] = useState<Tab>("workout");
  const [route, setRoute] = useState<Route>({ name: "tabs" });

  // Hook Android's back button / edge-swipe gesture into our navigation so it
  // goes "up" through the app instead of immediately closing it.
  useEffect(() => {
    const onBack = () => {
      // On a pushed full-screen route → return to the tabs.
      if (route.name !== "tabs") {
        setRoute({ name: "tabs" });
        return true;
      }
      // On a secondary tab → go back to the Workout home tab.
      if (tab !== "workout") {
        setTab("workout");
        return true;
      }
      // Already home → let the system handle it (exit the app).
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, [tab, route]);

  if (route.name === "active") {
    return <ActiveWorkoutScreen onClose={() => setRoute({ name: "tabs" })} />;
  }
  if (route.name === "newRoutine") {
    return <NewRoutineScreen onClose={() => setRoute({ name: "tabs" })} />;
  }
  if (route.name === "exercise") {
    return <ExerciseDetailScreen exerciseId={route.id} onClose={() => setRoute({ name: "tabs" })} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {tab === "workout" && (
          <WorkoutHomeScreen
            onOpenActive={() => setRoute({ name: "active" })}
            onNewRoutine={() => setRoute({ name: "newRoutine" })}
          />
        )}
        {tab === "history" && <HistoryScreen />}
        {tab === "progress" && (
          <ProgressScreen onOpenExercise={(id) => setRoute({ name: "exercise", id })} />
        )}
        {tab === "settings" && <SettingsScreen />}
      </View>
      <BottomNav active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
