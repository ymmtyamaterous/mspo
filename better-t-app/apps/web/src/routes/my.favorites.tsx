import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { SportCard } from "@/components/sport-card";
import { authClient } from "@/lib/auth-client";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/my/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [{ title: "お気に入り — MinorSports" }],
  }),
});

function FavoritesPage() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: sports = [], isLoading } = useQuery({
    ...orpc.favorites.list.queryOptions(),
    enabled: !!session,
  });

  const removeFav = useMutation({
    mutationFn: (sportId: string) => client.favorites.remove({ sportId }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("お気に入りを解除しました");
    },
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
          お気に入り
        </h1>
        <p style={{ fontSize: "13px", color: "var(--ms-muted)", marginTop: "4px" }}>
          {sports.length} 件
        </p>
      </div>

      {sports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <Heart size={48} style={{ color: "var(--ms-border)", margin: "0 auto 16px" }} />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              color: "var(--ms-muted)",
              marginBottom: "8px",
            }}
          >
            お気に入りがまだありません
          </p>
          <p style={{ fontSize: "13px", color: "var(--ms-muted)", marginBottom: "24px" }}>
            気になるスポーツをお気に入りに追加しよう
          </p>
          <a
            href="/sports"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "var(--ms-accent)",
              color: "#fff",
              textDecoration: "none",
              fontSize: "13px",
            }}
          >
            スポーツを探す
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {sports.map((sport) => (
            <div key={sport.id} style={{ position: "relative" }}>
              <SportCard {...sport} />
              <button
                type="button"
                aria-label="お気に入り解除"
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "var(--ms-accent)",
                  border: "none",
                  color: "#fff",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  removeFav.mutate(sport.id);
                }}
              >
                <Heart size={14} fill="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
