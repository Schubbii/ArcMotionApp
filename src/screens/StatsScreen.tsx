import { useMemo } from "react";
import { useAppData } from "../context/AppData";
import { LineChart, type ChartPoint } from "../components/LineChart";
import { round } from "../lib/format";

export function StatsScreen() {
  const { sets, exercises, settings } = useAppData();
  const unit = settings.unit;

  const stats = useMemo(() => {
    const totalSets = sets.length;
    const days = new Set(sets.map((s) => s.date));
    const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const exercisesTrained = new Set(sets.map((s) => s.exerciseId)).size;
    return {
      totalSets,
      workouts: days.size,
      volume: Math.round(totalVolume),
      exercisesTrained,
    };
  }, [sets]);

  // Weekly volume over the last 8 weeks.
  const volumePoints = useMemo<ChartPoint[]>(() => {
    if (sets.length === 0) return [];
    const byWeek = new Map<string, number>();
    for (const s of sets) {
      const d = new Date(s.date);
      // Bucket by ISO-ish week start (Monday).
      const day = (d.getDay() + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - day);
      const key = monday.toISOString().slice(0, 10);
      byWeek.set(key, (byWeek.get(key) ?? 0) + s.weight * s.reps);
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([k, v]) => ({ x: new Date(k).getTime(), y: round(v), label: k }));
  }, [sets]);

  const topExercises = useMemo(() => {
    const count = new Map<string, number>();
    for (const s of sets) count.set(s.exerciseId, (count.get(s.exerciseId) ?? 0) + 1);
    const nameById = new Map(exercises.map((e) => [e.id, e.name]));
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, c]) => ({ name: nameById.get(id) ?? "Exercise", sets: c }));
  }, [sets, exercises]);

  return (
    <div className="screen">
      <div className="topbar" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div>
          <h1>Progress</h1>
          <div className="sub">Spot trends & keep improving</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-value">{stats.workouts}</div>
          <div className="stat-label">Workouts</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.totalSets}</div>
          <div className="stat-label">Total sets</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">
            {stats.volume.toLocaleString()}
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}> {unit}</span>
          </div>
          <div className="stat-label">Total volume</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.exercisesTrained}</div>
          <div className="stat-label">Exercises trained</div>
        </div>
      </div>

      <div className="section-title">Weekly Volume</div>
      <div className="card">
        {volumePoints.length === 0 ? (
          <div className="empty" style={{ padding: "24px 0" }}>
            <div className="emoji">📊</div>
            Log workouts to build your trend.
          </div>
        ) : (
          <LineChart points={volumePoints} height={180} />
        )}
      </div>

      {topExercises.length > 0 && (
        <>
          <div className="section-title">Most Trained</div>
          <div className="card">
            {topExercises.map((t) => (
              <div className="set-row" key={t.name}>
                <div className="list-body">
                  <div className="list-title">{t.name}</div>
                </div>
                <div style={{ fontWeight: 700, color: "var(--text-muted)" }}>{t.sets} sets</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
