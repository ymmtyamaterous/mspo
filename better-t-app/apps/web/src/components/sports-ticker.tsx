type SportsTicker = {
  names: string[];
};

export function SportsTicker({ names }: SportsTicker) {
  if (names.length === 0) return null;
  // 2倍にして無限ループを実現
  const doubled = [...names, ...names];

  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1.5px solid var(--ms-border)",
        borderBottom: "1.5px solid var(--ms-border)",
        background: "var(--ink)",
        padding: "10px 0",
        whiteSpace: "nowrap",
      }}
    >
      <div
        className="animate-ticker"
        style={{
          display: "inline-flex",
          gap: "0",
        }}
      >
        {doubled.map((name, idx) => (
          <span
            key={idx}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              letterSpacing: "0.1em",
              color: "var(--paper)",
              padding: "0 32px",
              opacity: idx % 2 === 0 ? 1 : 0.5,
            }}
          >
            {name}
            <span style={{ marginLeft: "32px", color: "var(--ms-accent)" }}>×</span>
          </span>
        ))}
      </div>
    </div>
  );
}
