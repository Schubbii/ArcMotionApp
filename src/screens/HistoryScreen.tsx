import { useMemo } from "react";
import { useAppData } from "../context/AppData";
import { formatDateHeading, round } from "../lib/format";

export function HistoryScreen() {
  const { sets, exercises, settings } = useAppData();
  const unit = settings.unit;

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    exercises.forEach((e) => m.set(e.id, e.name));
    return m;
  }, [exercises]);

  // Group all sets by date -> by exercise.
  const days = useMemo(() => {
    const byDate = new Map<string, Map<string, typeof sets>>();
    for (const s of sets) {
      const exMap = byDate.get(s.date) ?? new Map();
      const arr = exMap.get(s.exerciseId) ?? [];
      arr.push(s);
      exMap.set(s.exerciseId, arr);
      byDate.set(s.date, exMap);
    }
    return [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [sets]);

  return (
    <div className="screen">
      <div className="topbar" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div>
          <h1>History</h1>
          <div className="sub">
            {days.length} workout{days.length === 1 ? "" : "s"} logged
          </div>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="empty">
          <div className="emoji">🗓️</div>
          Your logged workouts will appear here.
        </div>
      ) : (
        days.map(([date, exMap]) => (
          <div key={date}>
            <div className="section-title">{formatDateHeading(date)}</div>
            {[...exMap.entries()].map(([exId, exSets]) => (
              <div className="card" key={exId}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  {nameById.get(exId) ?? "Exercise"}
                </div>
                {exSets.map((s) => (
                  <div className="set-row" key={s.id}>
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
            ))}
          </div>
        ))
      )}
    </div>
  );
}
