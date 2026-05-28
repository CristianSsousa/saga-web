import type { Status } from "../api/library";

export const statusLabels: Record<Status, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
  dropped: "Dropped",
  on_hold: "On Hold",
};

export const statusColors: Record<Status, string> = {
  planning: "#6b7fa3",
  in_progress: "#e8a030",
  completed: "#16a085",
  dropped: "#c0392b",
  on_hold: "#8e44ad",
};

interface Props {
  value: Status;
  onChange: (s: Status) => void;
  className?: string;
}

export default function StatusSelect({ value, onChange, className = "" }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Status)}
      className={className}
      style={{
        background: "var(--color-surface)",
        color: statusColors[value],
        border: "1px solid var(--color-border-color)",
        borderRadius: "6px",
        padding: "4px 28px 4px 10px",
        fontSize: "12px",
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        letterSpacing: "0.02em",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7fa3' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        transition: "border-color 0.15s, color 0.15s",
        outline: "none",
      }}
    >
      {(Object.keys(statusLabels) as Status[]).map((s) => (
        <option key={s} value={s} style={{ color: statusColors[s] }}>
          {statusLabels[s]}
        </option>
      ))}
    </select>
  );
}
