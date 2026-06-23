import { useMemo, useState } from "react";
import { useAppData } from "../context/AppData";
import type { Exercise } from "../types";
import { Stepper } from "../components/Stepper";
import { LineChart, type ChartPoint } from "../components/LineChart";
import { ChevronLeft, TrophyIcon, TrashIcon } from "../components/Icons";
import {
  bestSetId,
  estimateOneRepMax,
  formatDateHeading,
  round,
} from "../lib/format";

type Tab = "track" | "history" | "graph";

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

export function ExerciseDetail({ exercise, onBack }: Props) {
  const { settings, logSet, deleteSet, setsForExercise } = useAppData();
  const [tab, setTab] = useState<Tab>("track");
  const [weight, setWeight] = useState(exercise.weighted ? 20 : 0);
  const [reps, setReps] = useState(8);

  const unit = settings.unit;
  const allSets = setsForExercise(exercise.id);

  const todaySets = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return allSets.filter((s) => s.date === today);
  }, [allSets]);

  const handleSave = () => {
    if (reps <= 0) return;
    logSet(exercise.id, weight, reps);
  };

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <ChevronLeft />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{exercise.name}</h1>
          <div className="topbar-sub" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {exercise.group}
          </div>
        </div>
      </div>

      <div className="tabs">
        {(["track", "history", "graph"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "track" ? "Track" : t === "history" ? "History" : "Graph"}
          </button>
        ))}
      </div>

      {tab === "track" && (
        <TrackTab
          weighted={exercise.weighted}
          unit={unit}
          weight={weight}
          reps={reps}
          setWeight={setWeight}
          setReps={setReps}
          onSave={handleSave}
          onClear={() => {
            setWeight(exercise.weighted ? 20 : 0);
            setReps(8);
          }}
          todaySets={todaySets}
          deleteSet={deleteSet}
        />
      )}

      {tab === "history" && <HistoryTab sets={[...allSets].reverse()} unit={unit} />}

      {tab === "graph" && <GraphTab sets={allSets} unit={unit} />}
    </div>
  );
}

function TrackTab({
  weighted,
  unit,
  weight,
  reps,
  setWeight,
  setReps,
  onSave,
  onClear,
  todaySets,
  deleteSet,
}: {
  weighted: boolean;
  unit: string;
  weight: number;
  reps: number;
  setWeight: (n: number) => void;
  setReps: (n: number) => void;
  onSave: () => void;
  onClear: () => void;
  todaySets: ReturnType<typeof useAppData>["sets"];
  deleteSet: (id: string) => void;
}) {
  const best = bestSetId(todaySets);
  return (
    <>
      <div className="card">
        {weighted && (
          <Stepper
            label={`Weight (${unit})`}
            value={weight}
            step={2.5}
            min={0}
            onChange={setWeight}
          />
        )}
        <Stepper label="Reps" value={reps} step={1} min={0} onChange={setReps} />
        <div className="btn-row" style={{ marginTop: 4 }}>
          <button className="btn btn-primary" onClick={onSave}>
            Save Set
          </button>
          <button className="btn btn-ghost" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      <div className="section-title">Today</div>
      {todaySets.length === 0 ? (
        <div className="empty">
          <div className="emoji">💪</div>
          No sets yet — log your first one above.
        </div>
      ) : (
        <div className="card">
          {todaySets.map((s, i) => (
            <div className="set-row" key={s.id}>
              <div className={`set-index ${s.id === best ? "best" : ""}`}>
                {s.id === best ? <TrophyIcon size={14} /> : i + 1}
              </div>
              <div className="set-main">
                {s.weight > 0 && (
                  <>
                    <span className="set-weight">{round(s.weight)}</span>
                    <span className="set-unit">{unit}</span>
                    <span className="set-x">×</span>
                  </>
                )}
                <span className="set-reps">{s.reps}</span>
                <span className="set-unit">reps</span>
              </div>
              <button
                className="set-del"
                onClick={() => deleteSet(s.id)}
                aria-label="Delete set"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function HistoryTab({
  sets,
  unit,
}: {
  sets: ReturnType<typeof useAppData>["sets"];
  unit: string;
}) {
  // Group by date, newest first.
  const groups = useMemo(() => {
    const map = new Map<string, typeof sets>();
    for (const s of sets) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [sets]);

  if (sets.length === 0) {
    return (
      <div className="empty">
        <div className="emoji">📒</div>
        No history yet for this exercise.
      </div>
    );
  }

  return (
    <>
      {groups.map(([date, daySets]) => {
        const best = bestSetId(daySets);
        return (
          <div key={date}>
            <div className="section-title">{formatDateHeading(date)}</div>
            <div className="card">
              {daySets.map((s, i) => (
                <div className="set-row" key={s.id}>
                  <div className={`set-index ${s.id === best ? "best" : ""}`}>
                    {s.id === best ? <TrophyIcon size={14} /> : i + 1}
                  </div>
                  <div className="set-main">
                    {s.weight > 0 && (
                      <>
                        <span className="set-weight">{round(s.weight)}</span>
                        <span className="set-unit">{unit}</span>
                        <span className="set-x">×</span>
                      </>
                    )}
                    <span className="set-reps">{s.reps}</span>
                    <span className="set-unit">reps</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function GraphTab({
  sets,
  unit,
}: {
  sets: ReturnType<typeof useAppData>["sets"];
  unit: string;
}) {
  // One point per day = best estimated 1RM that day.
  const points = useMemo<ChartPoint[]>(() => {
    const byDay = new Map<string, number>();
    for (const s of sets) {
      const e = estimateOneRepMax(s.weight || s.reps, s.weight ? s.reps : 1);
      byDay.set(s.date, Math.max(byDay.get(s.date) ?? 0, e));
    }
    return [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({
        x: new Date(date).getTime(),
        y: round(v),
        label: date,
      }));
  }, [sets]);

  if (points.length < 1) {
    return (
      <div className="empty">
        <div className="emoji">📈</div>
        Log a few sets to see your progress graph.
      </div>
    );
  }

  const latest = points[points.length - 1];
  const first = points[0];
  const delta = round(latest.y - first.y);

  return (
    <>
      <div className="section-title">Estimated 1 Rep Max</div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
          <span className="stat-value">{latest.y}</span>
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{unit}</span>
          {points.length > 1 && (
            <span
              style={{
                marginLeft: "auto",
                fontWeight: 700,
                color: delta >= 0 ? "var(--success)" : "var(--danger)",
              }}
            >
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} {unit}
            </span>
          )}
        </div>
        <LineChart points={points} />
      </div>
    </>
  );
}
