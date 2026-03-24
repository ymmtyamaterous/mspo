import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status-badge";
import { authClient } from "@/lib/auth-client";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/my/submissions")({
  component: SubmissionsPage,
  head: () => ({
    meta: [{ title: "自分の投稿 — MinorSports" }],
  }),
});

function SubmissionsPage() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    ...orpc.sports.list.queryOptions({
      input: { status: "pending", limit: 100 },
    }),
    enabled: !!session,
    select: (d) => d.items.filter((s) => s.submittedById === session?.user.id),
  });

  // 全ステータスで自分の投稿を取得（pending + published + rejected）
  const { data: allData } = useQuery({
    ...orpc.sports.list.queryOptions({ input: { sortBy: "createdAt", limit: 100 } }),
    enabled: !!session,
    select: (d) => d.items.filter((s) => s.submittedById === session?.user.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.sports.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("投稿を削除しました");
    },
    onError: (e) => toast.error(`削除に失敗しました: ${e.message}`),
  });

  if (isPending || isLoading) {
    return (
      <div style={{ padding: "64px", textAlign: "center", color: "var(--ms-muted)" }}>
        読み込み中...
      </div>
    );
  }

  if (!session) {
    navigate({ to: "/login" });
    return null;
  }

  const sports = allData ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        style={{
          borderBottom: "1.5px solid var(--ms-border)",
          paddingBottom: "24px",
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "40px",
            letterSpacing: "0.05em",
          }}
        >
          自分の投稿
        </h1>
        <p style={{ fontSize: "13px", color: "var(--ms-muted)", marginTop: "4px" }}>
          {sports.length} 件
        </p>
      </div>

      {sports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              color: "var(--ms-muted)",
              marginBottom: "16px",
            }}
          >
            まだ投稿がありません
          </p>
          <Link
            to="/submit"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "var(--ms-accent)",
              color: "#fff",
              textDecoration: "none",
              fontSize: "13px",
            }}
          >
            スポーツを投稿する
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {sports.map((sport) => (
            <div
              key={sport.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: "1px solid var(--ms-border)",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                  {sport.status === "published" ? (
                    <Link
                      to="/sports/$id"
                      params={{ id: sport.id }}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "20px",
                        letterSpacing: "0.03em",
                        color: "var(--ink)",
                        textDecoration: "none",
                      }}
                    >
                      {sport.name}
                    </Link>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "20px",
                        letterSpacing: "0.03em",
                        color: "var(--ink)",
                      }}
                    >
                      {sport.name}
                    </span>
                  )}
                  <StatusBadge status={sport.status} />
                </div>
                <p style={{ fontSize: "12px", color: "var(--ms-muted)" }}>
                  {new Date(sport.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {(sport.status === "pending" || sport.status === "published") && (
                  <Link
                    to="/sports/$id"
                    params={{ id: sport.id }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      border: "1px solid var(--ms-border)",
                      fontSize: "12px",
                      color: "var(--ink)",
                      textDecoration: "none",
                    }}
                  >
                    <Pencil size={12} /> 詳細
                  </Link>
                )}
                {sport.status === "pending" && (
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      border: "1px solid var(--ms-muted)",
                      background: "transparent",
                      fontSize: "12px",
                      color: "var(--ms-muted)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (confirm("本当に削除しますか？")) {
                        deleteMutation.mutate(sport.id);
                      }
                    }}
                  >
                    <Trash2 size={12} /> 削除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
