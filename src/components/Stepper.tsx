interface Props {
  label: string;
  value: number;
  step: number;
  min?: number;
  onChange: (n: number) => void;
}

export function Stepper({ label, value, step, min = 0, onChange }: Props) {
  const clamp = (n: number) => Math.max(min, Math.round(n * 100) / 100);
  return (
    <div className="stepper-group">
      <div className="stepper-label">{label}</div>
      <div className="stepper">
        <button onClick={() => onChange(clamp(value - step))} aria-label={`Decrease ${label}`}>
          −
        </button>
        <input
          className="value"
          type="number"
          inputMode="decimal"
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onChange(Number.isNaN(n) ? 0 : clamp(n));
          }}
        />
        <button onClick={() => onChange(clamp(value + step))} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}
