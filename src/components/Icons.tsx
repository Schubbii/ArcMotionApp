import Svg, { Path, Rect, Circle } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function Base({
  size = 24,
  color = "#000",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" color={color}>
      {children}
    </Svg>
  );
}

export function DumbbellIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Path {...stroke} d="M6.5 6.5 17.5 17.5" />
      <Path {...stroke} d="m21 21-1-1" />
      <Path {...stroke} d="m3 3 1 1" />
      <Path {...stroke} d="m18 22 4-4" />
      <Path {...stroke} d="m2 6 4-4" />
      <Path {...stroke} d="m3 10 7-7" />
      <Path {...stroke} d="m14 21 7-7" />
    </Base>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Rect {...stroke} x="3" y="4" width="18" height="18" rx="2" />
      <Path {...stroke} d="M16 2v4M8 2v4M3 10h18" />
    </Base>
  );
}

export function ChartIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Path {...stroke} d="M3 3v18h18" />
      <Path {...stroke} d="m19 9-5 5-4-4-3 3" />
    </Base>
  );
}

export function SettingsIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Circle {...stroke} cx="12" cy="12" r="3" />
      <Path
        {...stroke}
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
      />
    </Base>
  );
}

export function ChevronRight(p: IconProps) {
  return (
    <Base size={20} {...p}>
      <Path {...stroke} d="m9 18 6-6-6-6" />
    </Base>
  );
}

export function ChevronLeft(p: IconProps) {
  return (
    <Base size={22} {...p}>
      <Path {...stroke} d="m15 18-6-6 6-6" />
    </Base>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <Base size={22} {...p}>
      <Path {...stroke} d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function TrophyIcon(p: IconProps) {
  return (
    <Base size={16} {...p}>
      <Path {...stroke} d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <Path
        {...stroke}
        d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"
      />
    </Base>
  );
}

export function TrashIcon(p: IconProps) {
  return (
    <Base size={18} {...p}>
      <Path
        {...stroke}
        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      />
    </Base>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Base size={16} {...p}>
      <Path {...stroke} d="M20 6 9 17l-5-5" />
    </Base>
  );
}
