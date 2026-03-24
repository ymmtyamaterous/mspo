import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { client, orpc } from "@/utils/orpc";

const searchSchema = z.object({
  status: z.enum(["pending", "published", "rejected"]).optional().catch(undefined),
  page: z.number().optional().catch(1),
});

export const Route = createFileRoute("/admin/submissions")({
  validateSearch: searchSchema,
  component: AdminSubmissionsPage,
  head: () => ({
    meta: [{ title: "投稿審査 — 管理画面 — MinorSports" }],
  }),
});

function AdminSubmissionsPage() {
  const { status = "pending", page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery(
    orpc.admin.submissions.list.queryOptions({
      input: { status, limit: 20, offset: (page - 1) * 20 },
    })
  );

  const approveMutation = useMutation({
    mutationFn: (id: string) => client.admin.submissions.approve({ sportId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("承認しました");
    },
    onError: (e) => toast.error(`承認失敗: ${e.message}`),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      client.admin.submissions.reject({ sportId: id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("却下しました");
    },
    onError: (e) => toast.error(`却下失敗: ${e.message}`),
  });

  const tabs = [
    { value: "pending", label: "審査待ち" },
    { value: "published", label: "承認済み" },
    { value: "rejected", label: "却下済み" },
  ] as const;

  const items = data?.items ?? [];
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
        SUBMISSIONS
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "1.5px solid var(--ms-border)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            style={{
              padding: "10px 20px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: status === tab.value ? 700 : 400,
              borderBottom: status === tab.value ? "2px solid var(--ms-accent)" : "2px solid transparent",
              color: status === tab.value ? "var(--ink)" : "var(--ms-muted)",
              marginBottom: "-1.5px",
            }}
            onClick={() => navigate({ search: { status: tab.value, page: 1 } })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: "13px", color: "var(--ms-muted)", marginBottom: "16px" }}>
        {total} 件
      </p>

      {isLoading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "var(--ms-muted)" }}>読み込み中...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center", color: "var(--ms-muted)" }}>
          該当する投稿はありません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {items.map((sport) => (
            <div
              key={sport.id}
              style={{
                border: "1.5px solid var(--ms-border)",
                background: "#fff",
                padding: "20px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <Link
                      to="/sports/$id"
                      params={{ id: sport.id }}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "22px",
                        letterSpacing: "0.03em",
                        color: "var(--ink)",
                        textDecoration: "none",
                      }}
                    >
                      {sport.name}
                    </Link>
                    <StatusBadge status={sport.status} />
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--ms-muted)",
                      marginBottom: "8px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {sport.description}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--ms-muted)" }}>
                    投稿日: {new Date(sport.createdAt).toLocaleDateString("ja-JP")} ／
                    投稿者 ID: {sport.submittedById ?? "不明"}
                  </p>
                </div>

                {status === "pending" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
                    <button
                      type="button"
                      style={{
                        padding: "8px 16px",
                        background: "var(--ms-accent)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                      onClick={() => approveMutation.mutate(sport.id)}
                      disabled={approveMutation.isPending}
                    >
                      ✓ 承認
                    </button>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="却下理由（任意）"
                        value={rejectReason[sport.id] ?? ""}
                        onChange={(e) =>
                          setRejectReason((prev) => ({ ...prev, [sport.id]: e.target.value }))
                        }
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          border: "1px solid var(--ms-border)",
                          fontSize: "12px",
                        }}
                      />
                      <button
                        type="button"
                        style={{
                          padding: "6px 12px",
                          background: "transparent",
                          border: "1px solid var(--ms-muted)",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "var(--ms-muted)",
                        }}
                        onClick={() =>
                          rejectMutation.mutate({ id: sport.id, reason: rejectReason[sport.id] })
                        }
                        disabled={rejectMutation.isPending}
                      >
                        ✕ 却下
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
              onClick={() => navigate({ search: { status, page: i + 1 } })}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
