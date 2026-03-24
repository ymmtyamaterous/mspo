import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexPage,
  head: () => ({
    meta: [{ title: "ダッシュボード — 管理画面 — MinorSports" }],
  }),
});

function AdminIndexPage() {
  const { data: pendingData } = useQuery(
    orpc.admin.submissions.list.queryOptions({ input: { status: "pending", limit: 100 } })
  );

  const { data: sportsData } = useQuery(
    orpc.sports.list.queryOptions({ input: { sortBy: "createdAt", limit: 1 } })
  );

  const { data: categoriesData } = useQuery(
    orpc.categories.list.queryOptions({ input: {} })
  );

  const pendingCount = pendingData?.items.length ?? 0;
  const totalSports = sportsData?.total ?? 0;
  const totalCategories = categoriesData?.length ?? 0;

  const stats = [
    { label: "審査待ち投稿", value: pendingCount, to: "/admin/submissions", accent: pendingCount > 0 },
    { label: "スポーツ総数", value: totalSports, to: "/admin/sports", accent: false },
    { label: "カテゴリ数", value: totalCategories, to: "/admin/categories", accent: false },
  ];

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "40px",
          letterSpacing: "0.05em",
          marginBottom: "32px",
          borderBottom: "1.5px solid var(--ms-border)",
          paddingBottom: "16px",
        }}
      >
        DASHBOARD
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "48px",
        }}
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                border: stat.accent
                  ? `2px solid var(--ms-accent)`
                  : "1.5px solid var(--ms-border)",
                padding: "24px",
                background: "#fff",
              }}
            >
              <p style={{ fontSize: "12px", color: "var(--ms-muted)", marginBottom: "8px" }}>
                {stat.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "48px",
                  color: stat.accent ? "var(--ms-accent)" : "var(--ink)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div
          style={{
            border: "1.5px solid var(--ms-border)",
            padding: "24px",
            background: "#fff",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              marginBottom: "16px",
              letterSpacing: "0.05em",
            }}
          >
            クイックリンク
          </h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "8px", listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { to: "/admin/submissions", label: "→ 投稿を審査する" },
              { to: "/admin/pickup", label: "→ ピックアップを設定する" },
              { to: "/admin/categories", label: "→ カテゴリを管理する" },
            ].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  style={{
                    color: "var(--ms-accent)",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
