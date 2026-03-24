import { Link } from "@tanstack/react-router";

type RankingItemProps = {
  rank: number;
  id: string;
  name: string;
  originCountry?: string | null;
  category: { name: string; emoji: string };
  score: number;
  maxScore: number;
  type: "viewCount" | "favorites";
};

export function RankingItem({
  rank,
  id,
  name,
  originCountry,
  category,
  score,
  maxScore,
  type,
}: RankingItemProps) {
  const barWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <Link to="/sports/$id" params={{ id }} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px 0",
          borderBottom: "1px solid var(--ms-border)",
          transition: "background 0.1s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(26,20,16,0.03)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        {/* 順位 */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: rank <= 3 ? "40px" : "28px",
            color: rank <= 3 ? "var(--ms-accent)" : "var(--ms-muted)",
            minWidth: "52px",
            textAlign: "right",
            lineHeight: 1,
          }}
        >
          {rank}
        </div>

        {/* 情報 */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              letterSpacing: "0.03em",
              marginBottom: "4px",
            }}
          >
            {name}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--ms-muted)" }}>
              {category.emoji} {category.name}
            </span>
            {originCountry && (
              <span style={{ fontSize: "12px", color: "var(--ms-muted)" }}>
                🌍 {originCountry}
              </span>
            )}
          </div>

          {/* 人気度バー */}
          <div
            style={{
              marginTop: "8px",
              height: "3px",
              background: "var(--ms-border)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${barWidth}%`,
                background: "var(--ms-accent)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* スコア */}
        <div style={{ textAlign: "right", minWidth: "60px" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              color: "var(--ms-accent2)",
            }}
          >
            {score.toLocaleString()}
          </div>
          <div style={{ fontSize: "10px", color: "var(--ms-muted)", letterSpacing: "0.05em" }}>
            {type === "viewCount" ? "views" : "likes"}
          </div>
        </div>
      </div>
    </Link>
  );
}
