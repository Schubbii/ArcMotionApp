import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, BackHandler, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppDataProvider, useAppData } from "./src/context/AppData";
import { ProProvider, usePro } from "./src/context/ProContext";
import { ThemeContext } from "./src/theme/ThemeContext";
import { paletteFor } from "./src/theme/themes";
import { isCalendarLocked, resolveTheme } from "./src/lib/entitlements";
import { BottomNav, type Tab } from "./src/components/BottomNav";
import { GlassBackdrop } from "./src/components/GlassBackdrop";
import { FadeSlideIn } from "./src/components/motion";
import { ResumeBar } from "./src/components/ResumeBar";
import { WorkoutHomeScreen } from "./src/screens/WorkoutHomeScreen";
import { LibraryScreen } from "./src/screens/LibraryScreen";
import { ActiveWorkoutScreen } from "./src/screens/ActiveWorkoutScreen";
import { NewRoutineScreen } from "./src/screens/NewRoutineScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { ExerciseDetailScreen } from "./src/screens/ExerciseDetailScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { PlanDetailScreen } from "./src/screens/PlanDetailScreen";
import { WorkoutDetailScreen } from "./src/screens/WorkoutDetailScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { PaywallScreen } from "./src/screens/PaywallScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <ProProvider>
          <Themed />
        </ProProvider>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

/** Full-screen routes pushed over the tab bar. */
type Route =
  | { name: "tabs" }
  | { name: "active" }
  | { name: "newRoutine" }
  | { name: "exercise"; id: string; fromWorkoutId?: string }
  | { name: "plan"; id: string }
  | { name: "program"; id: string }
  | { name: "workout"; id: string; fromCalendar?: boolean }
  | { name: "calendar" }
  | { name: "paywall" };

/** Where "back" leads from a pushed route (one level up, then the tabs). */
function backRoute(route: Route): Route {
  if (route.name === "exercise" && route.fromWorkoutId) return { name: "workout", id: route.fromWorkoutId };
  if (route.name === "workout" && route.fromCalendar) return { name: "calendar" };
  return { name: "tabs" };
}

function Themed() {
  const { settings, ready } = useAppData();
  const { isPro } = usePro();
  // A lapsed/free user keeps their theme choice stored but is shown a free one,
  // so the app never renders a palette they can no longer access.
  const palette = paletteFor(resolveTheme(settings.theme, isPro));

  return (
    <ThemeContext.Provider value={palette}>
      <StatusBar style={palette.dark ? "light" : "dark"} />
      <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={["top"]}>
        <GlassBackdrop />
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
  const { isPro } = usePro();
  const [tab, setTab] = useState<Tab>("workout");
  const [route, setRoute] = useState<Route>({ name: "tabs" });

  // Hook Android's back button / edge-swipe gesture into our navigation so it
  // goes "up" through the app instead of immediately closing it.
  useEffect(() => {
    const onBack = () => {
      // On a pushed full-screen route → go one level up.
      if (route.name !== "tabs") {
        setRoute(backRoute(route));
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

  // Keyed FadeSlideIn remounts on every navigation, giving each screen a soft
  // fade + slide-up entrance.
  if (route.name === "active") {
    return (
      <FadeSlideIn key="active">
        <ActiveWorkoutScreen onClose={() => setRoute({ name: "tabs" })} />
      </FadeSlideIn>
    );
  }
  if (route.name === "newRoutine") {
    return (
      <FadeSlideIn key="newRoutine">
        <NewRoutineScreen onClose={() => setRoute({ name: "tabs" })} />
      </FadeSlideIn>
    );
  }
  if (route.name === "exercise") {
    return (
      <FadeSlideIn key={`exercise-${route.id}`}>
        <ExerciseDetailScreen exerciseId={route.id} onClose={() => setRoute(backRoute(route))} />
      </FadeSlideIn>
    );
  }
  if (route.name === "plan" || route.name === "program") {
    return (
      <FadeSlideIn key={`${route.name}-${route.id}`}>
        <PlanDetailScreen
          planId={route.name === "plan" ? route.id : undefined}
          programId={route.name === "program" ? route.id : undefined}
          onClose={() => setRoute({ name: "tabs" })}
          onOpenActive={() => setRoute({ name: "active" })}
        />
      </FadeSlideIn>
    );
  }
  if (route.name === "workout") {
    return (
      <FadeSlideIn key={`workout-${route.id}`}>
        <WorkoutDetailScreen
          workoutId={route.id}
          onClose={() => setRoute(backRoute(route))}
          onOpenExercise={(id) => setRoute({ name: "exercise", id, fromWorkoutId: route.id })}
        />
      </FadeSlideIn>
    );
  }
  if (route.name === "calendar") {
    return (
      <FadeSlideIn key="calendar">
        <CalendarScreen
          onClose={() => setRoute({ name: "tabs" })}
          onOpenWorkout={(id) => setRoute({ name: "workout", id, fromCalendar: true })}
        />
      </FadeSlideIn>
    );
  }
  if (route.name === "paywall") {
    return (
      <FadeSlideIn key="paywall">
        <PaywallScreen onClose={() => setRoute({ name: "tabs" })} />
      </FadeSlideIn>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FadeSlideIn key={tab} style={{ flex: 1 }}>
        {tab === "workout" && (
          <WorkoutHomeScreen
            onOpenActive={() => setRoute({ name: "active" })}
            onNewRoutine={() => setRoute({ name: "newRoutine" })}
          />
        )}
        {tab === "library" && (
          <LibraryScreen
            onOpenActive={() => setRoute({ name: "active" })}
            onOpenPlan={(id) => setRoute({ name: "plan", id })}
            onOpenProgram={(id) => setRoute({ name: "program", id })}
          />
        )}
        {tab === "history" && (
          <HistoryScreen
            onOpenWorkout={(id) => setRoute({ name: "workout", id })}
            onOpenCalendar={() =>
              setRoute(isCalendarLocked(isPro) ? { name: "paywall" } : { name: "calendar" })
            }
          />
        )}
        {tab === "progress" && (
          <ProgressScreen onOpenExercise={(id) => setRoute({ name: "exercise", id })} />
        )}
        {tab === "settings" && <SettingsScreen onOpenPaywall={() => setRoute({ name: "paywall" })} />}
      </FadeSlideIn>
      <ResumeBar onPress={() => setRoute({ name: "active" })} />
      <BottomNav active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
