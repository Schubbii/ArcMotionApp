import { useMemo, useState } from "react";
import { useAppData } from "../context/AppData";
import type { Exercise, MuscleGroup } from "../types";
import { ChevronRight, PlusIcon } from "../components/Icons";
import { shortDate } from "../lib/format";

const GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
  "Other",
];

interface Props {
  onOpen: (ex: Exercise) => void;
}

export function WorkoutScreen({ onOpen }: Props) {
  const { exercises, sets, addExercise } = useAppData();
  const [filter, setFilter] = useState<MuscleGroup | "All">("All");
  const [sheetOpen, setSheetOpen] = useState(false);

  const lastDoneByEx = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sets) {
      const prev = map.get(s.exerciseId);
      if (!prev || s.date > prev) map.set(s.exerciseId, s.date);
    }
    return map;
  }, [sets]);

  const visible = exercises.filter((e) => filter === "All" || e.group === filter);

  return (
    <div className="screen">
      <div className="topbar" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="brand-logo">A</div>
        <div>
          <h1>Workout</h1>
          <div className="sub">Pick an exercise to log</div>
        </div>
        <div className="spacer" />
        <button className="icon-btn" onClick={() => setSheetOpen(true)} aria-label="Add exercise">
          <PlusIcon />
        </button>
      </div>

      <div className="chips">
        {(["All", ...GROUPS] as const).map((g) => (
          <button
            key={g}
            className={`chip ${filter === g ? "active" : ""}`}
            onClick={() => setFilter(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <div className="emoji">🏋️</div>
          No exercises in this group yet.
        </div>
      ) : (
        visible.map((ex) => {
          const last = lastDoneByEx.get(ex.id);
          return (
            <button key={ex.id} className="list-row" onClick={() => onOpen(ex)}>
              <div className="list-avatar">{ex.name.slice(0, 1)}</div>
              <div className="list-body">
                <div className="list-title">{ex.name}</div>
                <div className="list-sub">
                  {ex.group}
                  {last ? ` · last ${shortDate(last)}` : " · not logged yet"}
                </div>
              </div>
              <span className="chev">
                <ChevronRight />
              </span>
            </button>
          );
        })
      )}

      {sheetOpen && <AddExerciseSheet onClose={() => setSheetOpen(false)} onAdd={addExercise} />}
    </div>
  );
}

function AddExerciseSheet({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, group: MuscleGroup, weighted: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>("Chest");
  const [weighted, setWeighted] = useState(true);

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name, group, weighted);
    onClose();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>New Exercise</h3>
        <div className="field">
          <label>Name</label>
          <input
            autoFocus
            value={name}
            placeholder="e.g. Incline Cable Fly"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Muscle group</label>
          <select value={group} onChange={(e) => setGroup(e.target.value as MuscleGroup)}>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Type</label>
          <div className="segment">
            <button className={weighted ? "active" : ""} onClick={() => setWeighted(true)}>
              Weighted
            </button>
            <button className={!weighted ? "active" : ""} onClick={() => setWeighted(false)}>
              Bodyweight
            </button>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
