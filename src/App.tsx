import { useState } from "react";
import { AppDataProvider } from "./context/AppData";
import { BottomNav, type Tab } from "./components/BottomNav";
import { WorkoutScreen } from "./screens/WorkoutScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ExerciseDetail } from "./screens/ExerciseDetail";
import type { Exercise } from "./types";

export default function App() {
  return (
    <AppDataProvider>
      <Shell />
    </AppDataProvider>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("workout");
  const [openExercise, setOpenExercise] = useState<Exercise | null>(null);

  return (
    <div className="app-shell">
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
      {!openExercise && <BottomNav active={tab} onChange={setTab} />}
    </div>
  );
}
