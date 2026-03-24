type StatusBadgeProps = {
  status: "pending" | "published" | "rejected";
};

const STATUS_CONFIG = {
  pending: { label: "審査中", bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  published: { label: "公開中", bg: "#dcfce7", color: "#166534", border: "#86efac" },
  rejected: { label: "却下", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        fontSize: "11px",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.05em",
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: "2px",
        fontWeight: 500,
      }}
    >
      {config.label}
    </span>
  );
}
