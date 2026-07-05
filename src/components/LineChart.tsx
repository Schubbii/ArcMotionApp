import { useMemo } from "react";
import Svg, {
  Path,
  Line,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

export interface ChartPoint {
  x: number;
  y: number;
}

interface Props {
  points: ChartPoint[];
  height?: number;
  /** Highlight the max point with a PR ring. */
  markMax?: boolean;
}

/** Dependency-light themed SVG line chart with an area fill. */
export function LineChart({ points, height = 200, markMax = false }: Props) {
  const t = useTheme();
  const W = 320;
  const H = height;
  const padX = 16;
  const padY = 18;

  const data = useMemo(() => {
    if (points.length === 0) return null;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || 1;
    const pad = (maxY - minY) * 0.15 || Math.max(1, maxY * 0.1);
    const lowY = minY - pad;
    const highY = maxY + pad;

    const sx = (x: number) => padX + ((x - minX) / spanX) * (W - padX * 2);
    const sy = (y: number) => H - padY - ((y - lowY) / (highY - lowY || 1)) * (H - padY * 2);

    const coords = points.map((p) => ({ x: sx(p.x), y: sy(p.y), v: p.y }));
    const single = coords.length === 1;
    const line = single
      ? `M ${padX} ${coords[0].y} L ${W - padX} ${coords[0].y}`
      : coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
    const area = `${line} L ${coords[coords.length - 1].x} ${H - padY} L ${single ? padX : coords[0].x} ${H - padY} Z`;

    const ticks = 3;
    const grid = Array.from({ length: ticks + 1 }, (_, i) => {
      const v = lowY + ((highY - lowY) * i) / ticks;
      return { y: sy(v), v: Math.round(v) };
    });

    const maxIdx = ys.indexOf(maxY);
    return { coords, line, area, grid, maxIdx };
  }, [points, H]);

  if (!data) return null;

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={t.primary} stopOpacity={0.3} />
          <Stop offset="100%" stopColor={t.primary} stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      {data.grid.map((g, i) => (
        <Line key={i} x1={padX} x2={W - padX} y1={g.y} y2={g.y} stroke={t.border} strokeWidth={1} />
      ))}
      {data.grid.map((g, i) => (
        <SvgText key={`t${i}`} x={W - padX} y={g.y - 3} fontSize={9} fill={t.textMuted} textAnchor="end">
          {g.v}
        </SvgText>
      ))}
      <Path d={data.area} fill="url(#fill)" />
      <Path d={data.line} fill="none" stroke={t.primary} strokeWidth={2.5} />
      {data.coords.map((c, i) => {
        const isMax = markMax && i === data.maxIdx;
        return (
          <Circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={isMax ? 5 : i === data.coords.length - 1 ? 4.5 : 3}
            fill={isMax ? t.trophy : t.surface}
            stroke={isMax ? t.trophy : t.primary}
            strokeWidth={2.5}
          />
        );
      })}
    </Svg>
  );
}
