import type { ReactNode } from "react";
import Svg, { Path, Rect, Circle, Polyline } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

const s = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function Base({ size = 24, color = "#000", children }: IconProps & { children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" color={color}>
      {children}
    </Svg>
  );
}

export function DumbbellIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Path {...s} d="m6.5 6.5 11 11" />
      <Path {...s} d="m21 21-1-1" />
      <Path {...s} d="m3 3 1 1" />
      <Path {...s} d="m18 22 4-4" />
      <Path {...s} d="m2 6 4-4" />
      <Path {...s} d="m3 10 7-7" />
      <Path {...s} d="m14 21 7-7" />
    </Base>
  );
}

export function HistoryIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Path {...s} d="M3 3v5h5" />
      <Path {...s} d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <Path {...s} d="M12 7v5l4 2" />
    </Base>
  );
}

export function ChartIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Path {...s} d="M3 3v18h18" />
      <Path {...s} d="m19 9-5 5-4-4-3 3" />
    </Base>
  );
}

export function SettingsIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Circle {...s} cx="12" cy="12" r="3" />
      <Path
        {...s}
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
      />
    </Base>
  );
}

export function ChevronRight(p: IconProps) {
  return (
    <Base size={20} {...p}>
      <Path {...s} d="m9 18 6-6-6-6" />
    </Base>
  );
}

export function ChevronLeft(p: IconProps) {
  return (
    <Base size={22} {...p}>
      <Path {...s} d="m15 18-6-6 6-6" />
    </Base>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <Base size={22} {...p}>
      <Path {...s} d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Base size={16} {...p}>
      <Polyline {...s} points="20 6 9 17 4 12" />
    </Base>
  );
}

export function TrashIcon(p: IconProps) {
  return (
    <Base size={18} {...p}>
      <Path
        {...s}
        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      />
    </Base>
  );
}

export function TrophyIcon(p: IconProps) {
  return (
    <Base size={16} {...p}>
      <Path {...s} d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <Path
        {...s}
        d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"
      />
    </Base>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <Base size={20} {...p}>
      <Circle {...s} cx="11" cy="11" r="8" />
      <Path {...s} d="m21 21-4.3-4.3" />
    </Base>
  );
}

export function CloseIcon(p: IconProps) {
  return (
    <Base size={22} {...p}>
      <Path {...s} d="M18 6 6 18M6 6l12 12" />
    </Base>
  );
}

export function ClockIcon(p: IconProps) {
  return (
    <Base size={18} {...p}>
      <Circle {...s} cx="12" cy="12" r="9" />
      <Path {...s} d="M12 7v5l3 2" />
    </Base>
  );
}

export function BookIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Path {...s} d="M12 7v14" />
      <Path
        {...s}
        d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
      />
    </Base>
  );
}

export function PencilIcon(p: IconProps) {
  return (
    <Base size={14} {...p}>
      <Path {...s} d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </Base>
  );
}

export function FlameIcon(p: IconProps) {
  return (
    <Base size={18} {...p}>
      <Path
        {...s}
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"
      />
    </Base>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <Base {...p}>
      <Rect {...s} x="3" y="4" width="18" height="18" rx="2" />
      <Path {...s} d="M16 2v4" />
      <Path {...s} d="M8 2v4" />
      <Path {...s} d="M3 10h18" />
    </Base>
  );
}
