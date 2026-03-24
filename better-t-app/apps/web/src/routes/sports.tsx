import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { SearchBar } from "@/components/search-bar";
import { SportCard } from "@/components/sport-card";
import { orpc } from "@/utils/orpc";

const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["createdAt", "viewCount", "popularity"]).optional(),
  page: z.number().optional(),
});

export const Route = createFileRoute("/sports")({
  validateSearch: searchSchema,
  component: SportsPage,
  head: () => ({
    meta: [{ title: "スポーツ図鑑 — MinorSports" }],
  }),
});

function SportsPage() {
  const { search, category, sort = "createdAt", page = 1 } = Route.useSearch();
  const navigate = useNavigate({ from: "/sports" });

  const { data: categoriesData } = useQuery(orpc.categories.list.queryOptions());
  const { data, isLoading } = useQuery(
    orpc.sports.list.queryOptions({
      input: {
        search,
        categoryId: category,
        sortBy: sort,
        page,
        limit: 18,
      },
    }),
  );

  const categories = categoriesData ?? [];
  const sports = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 18);

  const setParam = (key: string, value: string | undefined) => {
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, [key]: value, page: 1 }) });
  };

  return (
    <div>
      <div
        style={{
          borderBottom: "1.5px solid var(--ms-border)",
          padding: "32px 0",
          background: "var(--search-bg)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "48px",
              letterSpacing: "0.05em",
              marginBottom: "16px",
            }}
          >
            スポーツ図鑑
          </h1>
          <SearchBar
            defaultValue={search ?? ""}
            onSearch={(v) => setParam("search", v || undefined)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <aside>
            <div style={{ border: "1.5px solid var(--ms-border)", padding: "20px" }}>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--ms-muted)",
                  marginBottom: "12px",
                }}
              >
                カテゴリ
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <button
                  type="button"
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    fontSize: "13px",
                    background: !category ? "var(--ink)" : "transparent",
                    color: !category ? "var(--paper)" : "var(--ink)",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.03em",
                  }}
                  onClick={() => setParam("category", undefined)}
                >
                  すべて
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: "13px",
                      background: category === cat.id ? "var(--ink)" : "transparent",
                      color: category === cat.id ? "var(--paper)" : "var(--ink)",
                      border: "none",
                      cursor: "pointer",
                      letterSpacing: "0.03em",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onClick={() => setParam("category", cat.id)}
                  >
                    <span>{cat.emoji}</span>
                    <span style={{ flex: 1 }}>{cat.name}</span>
                    <span style={{ fontSize: "11px", color: "var(--ms-muted)" }}>
                      {cat.sportCount}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--ms-border)", marginTop: "16px", paddingTop: "16px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ms-muted)",
                    marginBottom: "12px",
                  }}
                >
                  並び順
                </p>
                {(
                  [
                    { value: "createdAt", label: "新着順" },
                    { value: "viewCount", label: "閲覧数順" },
                    { value: "popularity", label: "人気順" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: "13px",
                      background: sort === opt.value ? "var(--ink)" : "transparent",
                      color: sort === opt.value ? "var(--paper)" : "var(--ink)",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, sort: opt.value }) })
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* メイン */}
          <div className="lg:col-span-3">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <p style={{ fontSize: "13px", color: "var(--ms-muted)" }}>
                {total.toLocaleString()} 件
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1.5px solid var(--ms-border)",
                      height: "200px",
                      background: "var(--search-bg)",
                      animation: "pulse 2s infinite",
                    }}
                  />
                ))}
              </div>
            ) : sports.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ms-muted)" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "24px" }}>
                  スポーツが見つかりませんでした
                </p>
                <p style={{ fontSize: "13px", marginTop: "8px" }}>
                  別のキーワードやカテゴリで試してみてください
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                {sports.map((s) => (
                  <SportCard key={s.id} {...s} />
                ))}
              </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "32px",
                  flexWrap: "wrap",
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1.5px solid var(--ms-border)",
                      background: page === p ? "var(--ink)" : "var(--paper)",
                      color: page === p ? "var(--paper)" : "var(--ink)",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, page: p }) })
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
