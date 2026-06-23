import { useAppData } from "../context/AppData";
import { THEMES } from "../data/themes";
import { CheckIcon } from "../components/Icons";

export function SettingsScreen() {
  const { settings, setTheme, setUnit } = useAppData();

  return (
    <div className="screen">
      <div className="topbar" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div>
          <h1>Settings</h1>
          <div className="sub">Make ArcMotion yours</div>
        </div>
      </div>

      <div className="section-title">Theme</div>
      <p style={{ margin: "0 4px 12px", fontSize: 13, color: "var(--text-muted)" }}>
        Pick a color theme — it instantly recolors the whole app.
      </p>
      {THEMES.map((t) => {
        const active = settings.theme === t.id;
        return (
          <button
            key={t.id}
            className={`theme-card ${active ? "active" : ""}`}
            onClick={() => setTheme(t.id)}
          >
            <div className="swatches">
              {t.swatches.map((c, i) => (
                <span key={i} className="swatch" style={{ background: c }} />
              ))}
            </div>
            <div className="list-body">
              <div className="list-title">{t.name}</div>
              <div className="list-sub">{t.description}</div>
            </div>
            {active && (
              <span className="theme-check">
                <CheckIcon />
              </span>
            )}
          </button>
        );
      })}

      <div className="section-title">Units</div>
      <div className="card">
        <div className="segment">
          <button
            className={settings.unit === "kg" ? "active" : ""}
            onClick={() => setUnit("kg")}
          >
            Kilograms (kg)
          </button>
          <button
            className={settings.unit === "lb" ? "active" : ""}
            onClick={() => setUnit("lb")}
          >
            Pounds (lb)
          </button>
        </div>
      </div>

      <div className="section-title">About</div>
      <div className="card">
        <div className="list-title">ArcMotion</div>
        <div className="list-sub" style={{ marginTop: 4 }}>
          A simple, modern workout tracker. Your data is stored privately on this
          device.
        </div>
      </div>
    </div>
  );
}
