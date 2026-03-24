import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { RankingItem } from "@/components/ranking-item";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/ranking")({
  component: RankingPage,
  head: () => ({
    meta: [{ title: "ランキング — MinorSports" }],
  }),
});

type RankingType = "viewCount" | "favorites";

function RankingPage() {
  const [type, setType] = useState<RankingType>("viewCount");

  const { data = [], isLoading } = useQuery(
    orpc.rankings.get.queryOptions({ input: { type, limit: 20 } }),
  );

  const maxScore = data[0]?.score ?? 1;

  return (
    <div>
      <div
        style={{
          borderBottom: "1.5px solid var(--ms-border)",
          padding: "48px 0",
          background: "var(--search-bg)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "56px",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            ランキング
          </h1>
          <p style={{ fontSize: "14px", color: "var(--ms-muted)" }}>
            人気のスポーツをランキング形式で
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブ */}
        <div
          style={{
            display: "flex",
            borderBottom: "1.5px solid var(--ms-border)",
            marginBottom: "32px",
          }}
        >
          {(
            [
              { value: "viewCount", label: "閲覧数" },
              { value: "favorites", label: "お気に入り数" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              style={{
                padding: "12px 24px",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                letterSpacing: "0.05em",
                background: "transparent",
                border: "none",
                borderBottom: type === tab.value ? "2px solid var(--ms-accent)" : "2px solid transparent",
                color: type === tab.value ? "var(--ms-accent)" : "var(--ms-muted)",
                cursor: "pointer",
                marginBottom: "-1.5px",
              }}
              onClick={() => setType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "80px",
                  background: "var(--search-bg)",
                  borderBottom: "1px solid var(--ms-border)",
                }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ms-muted)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "24px" }}>
              データがありません
            </p>
          </div>
        ) : (
          <div>
            {data.map((item) => (
              <RankingItem
                key={item.id}
                rank={item.rank}
                id={item.id}
                name={item.name}
                originCountry={item.originCountry}
                category={item.category}
                score={item.score}
                maxScore={maxScore}
                type={type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
