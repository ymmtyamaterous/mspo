import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { CategoryCard } from "@/components/category-grid";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({
    meta: [{ title: "カテゴリ — MinorSports" }],
  }),
});

function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery(
    orpc.categories.list.queryOptions(),
  );

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
            カテゴリ
          </h1>
          <p style={{ fontSize: "14px", color: "var(--ms-muted)" }}>
            競技の種類から探す
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  border: "1.5px solid var(--ms-border)",
                  height: "140px",
                  background: "var(--search-bg)",
                  margin: "-0.75px",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} {...cat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
