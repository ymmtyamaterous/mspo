import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { client, orpc } from "@/utils/orpc";

const searchSchema = z.object({
  search: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  page: z.number().optional().catch(1),
});

export const Route = createFileRoute("/admin/sports")({
  validateSearch: searchSchema,
  component: AdminSportsPage,
  head: () => ({
    meta: [{ title: "スポーツ管理 — 管理画面 — MinorSports" }],
  }),
});

function AdminSportsPage() {
  const { search, category, page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    orpc.sports.list.queryOptions({
      input: {
        search,
        categoryId: category,
        sortBy: "createdAt",
        limit: 20,
        offset: (page - 1) * 20,
      },
    })
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.sports.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("削除しました");
    },
    onError: (e) => toast.error(`削除失敗: ${e.message}`),
  });

  const { data: categories } = useQuery(
    orpc.categories.list.queryOptions({ input: {} })
  );

  const sports = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "40px",
          letterSpacing: "0.05em",
          marginBottom: "24px",
          borderBottom: "1.5px solid var(--ms-border)",
          paddingBottom: "16px",
        }}
      >
        SPORTS MANAGEMENT
      </h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="スポーツ名で検索..."
          defaultValue={search ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate({ search: { search: e.currentTarget.value, page: 1 } });
            }
          }}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1.5px solid var(--ms-border)",
            fontSize: "13px",
          }}
        />
        <select
          value={category ?? ""}
          onChange={(e) => navigate({ search: { category: e.target.value || undefined, page: 1 } })}
          style={{
            padding: "8px 12px",
            border: "1.5px solid var(--ms-border)",
            fontSize: "13px",
            background: "#fff",
          }}
        >
          <option value="">すべてのカテゴリ</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: "13px", color: "var(--ms-muted)", marginBottom: "16px" }}>
        {total} 件
      </p>

      {isLoading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "var(--ms-muted)" }}>読み込み中...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--ms-border)", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", fontWeight: 700 }}>スポーツ名</th>
              <th style={{ padding: "10px 12px", fontWeight: 700 }}>カテゴリ</th>
              <th style={{ padding: "10px 12px", fontWeight: 700 }}>ステータス</th>
              <th style={{ padding: "10px 12px", fontWeight: 700 }}>閲覧数</th>
              <th style={{ padding: "10px 12px", fontWeight: 700 }}>投稿日</th>
              <th style={{ padding: "10px 12px", fontWeight: 700 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {sports.map((sport) => (
              <tr
                key={sport.id}
                style={{ borderBottom: "1px solid var(--ms-border)" }}
              >
                <td style={{ padding: "12px" }}>
                  <Link
                    to="/sports/$id"
                    params={{ id: sport.id }}
                    style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 600 }}
                  >
                    {sport.name}
                  </Link>
                </td>
                <td style={{ padding: "12px", color: "var(--ms-muted)" }}>
                  {(sport as any).categoryName ?? "-"}
                </td>
                <td style={{ padding: "12px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      background:
                        sport.status === "published"
                          ? "#16a34a22"
                          : sport.status === "pending"
                            ? "#ca8a0422"
                            : "#dc262622",
                      color:
                        sport.status === "published"
                          ? "#16a34a"
                          : sport.status === "pending"
                            ? "#ca8a04"
                            : "#dc2626",
                    }}
                  >
                    {sport.status === "published" ? "公開中" : sport.status === "pending" ? "審査待ち" : "却下"}
                  </span>
                </td>
                <td style={{ padding: "12px", color: "var(--ms-muted)" }}>
                  {sport.viewCount}
                </td>
                <td style={{ padding: "12px", color: "var(--ms-muted)" }}>
                  {new Date(sport.createdAt).toLocaleDateString("ja-JP")}
                </td>
                <td style={{ padding: "12px" }}>
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      border: "1px solid var(--ms-muted)",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "var(--ms-muted)",
                    }}
                    onClick={() => {
                      if (confirm("削除しますか？")) {
                        deleteMutation.mutate(sport.id);
                      }
                    }}
                  >
                    <Trash2 size={11} /> 削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              type="button"
              style={{
                padding: "8px 14px",
                border: page === i + 1 ? "2px solid var(--ms-accent)" : "1px solid var(--ms-border)",
                background: page === i + 1 ? "var(--ms-accent)" : "transparent",
                color: page === i + 1 ? "#fff" : "var(--ink)",
                cursor: "pointer",
                fontSize: "13px",
              }}
              onClick={() => navigate({ search: { search, category, page: i + 1 } })}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
