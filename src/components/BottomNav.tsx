import { CalendarIcon, ChartIcon, DumbbellIcon, SettingsIcon } from "./Icons";

export type Tab = "workout" | "history" | "stats" | "settings";

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
}

const ITEMS: { id: Tab; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: "workout", label: "Workout", Icon: DumbbellIcon },
  { id: "history", label: "History", Icon: CalendarIcon },
  { id: "stats", label: "Progress", Icon: ChartIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-item ${active === id ? "active" : ""}`}
          onClick={() => onChange(id)}
        >
          <Icon />
          {label}
        </button>
      ))}
    </nav>
  );
}
