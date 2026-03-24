type DifficultyStarsProps = {
  value: number; // 1〜5
  size?: "sm" | "md";
};

export function DifficultyStars({ value, size = "sm" }: DifficultyStarsProps) {
  const fontSize = size === "md" ? "16px" : "12px";
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{
            fontSize,
            color: i < value ? "var(--ms-accent)" : "var(--ms-border)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
