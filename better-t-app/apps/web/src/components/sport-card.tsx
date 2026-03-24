import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";

import { DifficultyStars } from "./difficulty-stars";

type SportCardProps = {
  id: string;
  name: string;
  nameEn?: string | null;
  originCountry?: string | null;
  difficulty?: number | null;
  viewCount: number;
  category: { id: string; name: string; emoji: string };
  imageUrl?: string | null;
  status?: string;
};

export function SportCard({
  id,
  name,
  nameEn,
  originCountry,
  difficulty,
  viewCount,
  category,
  imageUrl,
  status,
}: SportCardProps) {
  return (
    <Link
      to="/sports/$id"
      params={{ id }}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          border: "1.5px solid var(--ms-border)",
          background: "var(--paper)",
          overflow: "hidden",
          transition: "background 0.15s",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(26,20,16,0.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "var(--paper)";
        }}
      >
        {/* カテゴリカラーバー */}
        <div
          style={{
            height: "4px",
            background: "var(--ms-accent)",
          }}
        />

        {/* 画像 */}
        {imageUrl && (
          <div
            style={{
              height: "140px",
              overflow: "hidden",
              background: "var(--search-bg)",
            }}
          >
            <img
              src={imageUrl}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {/* コンテンツ */}
        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* カテゴリバッジ */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>{category.emoji}</span>
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ms-muted)",
              }}
            >
              {category.name}
            </span>
          </div>

          {/* スポーツ名 */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                letterSpacing: "0.03em",
                lineHeight: 1.1,
                color: "var(--ink)",
              }}
            >
              {name}
            </div>
            {nameEn && (
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--ms-muted)",
                  letterSpacing: "0.05em",
                  marginTop: "2px",
                }}
              >
                {nameEn}
              </div>
            )}
          </div>

          {/* メタ情報 */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
            {originCountry && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--ms-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>🌍</span> {originCountry}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {difficulty && <DifficultyStars value={difficulty} />}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: "var(--ms-muted)",
                }}
              >
                <Eye size={12} />
                {viewCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
