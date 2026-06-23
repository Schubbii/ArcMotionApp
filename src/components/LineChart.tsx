import { useMemo } from "react";

export interface ChartPoint {
  x: number; // timestamp
  y: number; // value
  label: string;
}

interface Props {
  points: ChartPoint[];
  height?: number;
}

/**
 * Minimal dependency-free SVG line chart with an area fill, matching the
 * "Interactive Progress Graphs" reference. Colors come from theme tokens.
 */
export function LineChart({ points, height = 200 }: Props) {
  const W = 320;
  const H = height;
  const padX = 14;
  const padY = 18;

  const { path, area, dots, yLabels } = useMemo(() => {
    if (points.length === 0) {
      return { path: "", area: "", dots: [], yLabels: [] as { y: number; v: number }[] };
    }
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const pad = spanY * 0.15 || 1;
    const lowY = minY - pad;
    const highY = maxY + pad;

    const sx = (x: number) =>
      padX + ((x - minX) / spanX) * (W - padX * 2);
    const sy = (y: number) =>
      H - padY - ((y - lowY) / (highY - lowY)) * (H - padY * 2);

    const coords = points.map((p) => ({ x: sx(p.x), y: sy(p.y), v: p.y }));
    const single = coords.length === 1;
    const linePath = single
      ? `M ${padX} ${coords[0].y} L ${W - padX} ${coords[0].y}`
      : coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
    const areaPath = single
      ? `M ${padX} ${coords[0].y} L ${W - padX} ${coords[0].y} L ${W - padX} ${H - padY} L ${padX} ${H - padY} Z`
      : `${linePath} L ${coords[coords.length - 1].x} ${H - padY} L ${coords[0].x} ${H - padY} Z`;

    const ticks = 3;
    const labels = Array.from({ length: ticks + 1 }, (_, i) => {
      const v = lowY + ((highY - lowY) * i) / ticks;
      return { y: sy(v), v };
    });

    return { path: linePath, area: areaPath, dots: coords, yLabels: labels };
  }, [points]);

  if (points.length === 0) return null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yLabels.map((l, i) => (
        <g key={i}>
          <line
            x1={padX}
            x2={W - padX}
            y1={l.y}
            y2={l.y}
            stroke="var(--border)"
            strokeWidth="1"
          />
          <text x={W - padX} y={l.y - 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">
            {Math.round(l.v)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#areaFill)" />
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={i === dots.length - 1 ? 4.5 : 3}
          fill="var(--surface)"
          stroke="var(--primary)"
          strokeWidth="2.5"
        />
      ))}
    </svg>
  );
}
