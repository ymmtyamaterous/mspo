import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Heart, Play } from "lucide-react";
import { toast } from "sonner";

import { DifficultyStars } from "@/components/difficulty-stars";
import { SportCard } from "@/components/sport-card";
import { authClient } from "@/lib/auth-client";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/sports/$id")({
  component: SportDetailPage,
});

function SportDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const { data: sport, isLoading } = useQuery(
    orpc.sports.getById.queryOptions({ input: { id } }),
  );

  const { data: favoriteData } = useQuery({
    ...orpc.favorites.isFavorited.queryOptions({ input: { sportId: id } }),
    enabled: !!session,
  });

  const addFav = useMutation({
    mutationFn: () => client.favorites.add({ sportId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("お気に入りに追加しました");
    },
  });

  const removeFav = useMutation({
    mutationFn: () => client.favorites.remove({ sportId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("お気に入りを解除しました");
    },
  });

  const { data: related } = useQuery({
    ...orpc.sports.list.queryOptions({
      input: { categoryId: sport?.categoryId, limit: 4 },
    }),
    enabled: !!sport?.categoryId,
  });

  if (isLoading) {
    return (
      <div style={{ padding: "64px", textAlign: "center", color: "var(--ms-muted)" }}>
        読み込み中...
      </div>
    );
  }

  if (!sport) {
    return (
      <div style={{ padding: "64px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--ms-muted)" }}>
          このスポーツは存在しません
        </p>
        <Link to="/sports" style={{ color: "var(--ms-accent)", fontSize: "13px" }}>
          スポーツ一覧へ戻る
        </Link>
      </div>
    );
  }

  const isFav = favoriteData?.isFavorited ?? false;

  return (
    <div>
      {/* パンくず */}
      <div
        style={{
          borderBottom: "1px solid var(--ms-border)",
          padding: "12px 0",
          background: "var(--search-bg)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--ms-muted)" }}>
            <Link to="/" style={{ color: "var(--ms-muted)", textDecoration: "none" }}>ホーム</Link>
            <span>/</span>
            <Link to="/sports" style={{ color: "var(--ms-muted)", textDecoration: "none" }}>図鑑</Link>
            <span>/</span>
            <span>{sport.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <main className="lg:col-span-2">
            {/* タイトル */}
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--ms-accent)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {sport.category?.emoji} {sport.category?.name}
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(36px, 6vw, 64px)",
                  letterSpacing: "0.03em",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {sport.name}
              </h1>
              {sport.nameEn && (
                <p style={{ fontSize: "16px", color: "var(--ms-muted)", letterSpacing: "0.08em" }}>
                  {sport.nameEn}
                </p>
              )}
            </div>

            {/* 概要 */}
            <section style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "14px", lineHeight: 1.9, color: "var(--ink)" }}>
                {sport.description}
              </p>
            </section>

            {/* ルール */}
            {sport.rules && (
              <section style={{ marginBottom: "32px" }}>
                <SectionTitle>ルール</SectionTitle>
                <p style={{ fontSize: "14px", lineHeight: 1.9, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                  {sport.rules}
                </p>
              </section>
            )}

            {/* 歴史 */}
            {sport.history && (
              <section style={{ marginBottom: "32px" }}>
                <SectionTitle>歴史・背景</SectionTitle>
                <p style={{ fontSize: "14px", lineHeight: 1.9, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                  {sport.history}
                </p>
              </section>
            )}

            {/* 動画 */}
            {sport.videoUrl && (
              <section style={{ marginBottom: "32px" }}>
                <SectionTitle>紹介動画</SectionTitle>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    src={sport.videoUrl}
                    title={`${sport.name} 紹介動画`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                    allowFullScreen
                  />
                </div>
              </section>
            )}
          </main>

          {/* サイドバー */}
          <aside>
            {/* 画像 */}
            {sport.imageUrl && (
              <div style={{ marginBottom: "24px", border: "1.5px solid var(--ms-border)", overflow: "hidden" }}>
                <img
                  src={sport.imageUrl}
                  alt={sport.name}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            )}

            {/* メタ情報 */}
            <div style={{ border: "1.5px solid var(--ms-border)", padding: "20px", marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--ms-muted)",
                  marginBottom: "16px",
                }}
              >
                詳細情報
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sport.originCountry && (
                  <MetaItem label="発祥地" value={`🌍 ${sport.originCountry}`} />
                )}
                {sport.foundedYear && (
                  <MetaItem label="発祥年" value={`${sport.foundedYear}年`} />
                )}
                {sport.playerCount && (
                  <MetaItem label="競技人口" value={sport.playerCount} />
                )}
                {sport.difficulty && (
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--ms-muted)", marginBottom: "4px" }}>難易度</p>
                    <DifficultyStars value={sport.difficulty} size="md" />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Eye size={14} style={{ color: "var(--ms-muted)" }} />
                  <span style={{ fontSize: "13px", color: "var(--ms-muted)" }}>
                    {sport.viewCount.toLocaleString()} 閲覧
                  </span>
                </div>
              </div>
            </div>

            {/* カテゴリ */}
            <div style={{ marginBottom: "16px" }}>
              <Link
                to="/sports"
                search={{ category: sport.categoryId }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  border: "1.5px solid var(--ms-border)",
                  textDecoration: "none",
                  fontSize: "13px",
                  color: "var(--ink)",
                }}
              >
                <span>{sport.category?.emoji}</span>
                <span>{sport.category?.name}</span>
              </Link>
            </div>

            {/* タグ */}
            {(sport.tags as string[]).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {(sport.tags as string[]).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "4px 10px",
                      border: "1px solid var(--ms-border)",
                      fontSize: "11px",
                      color: "var(--ms-muted)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* お気に入りボタン */}
            {session && (
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: isFav ? "var(--ms-accent)" : "transparent",
                  color: isFav ? "#fff" : "var(--ink)",
                  border: `1.5px solid ${isFav ? "var(--ms-accent)" : "var(--ink)"}`,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onClick={() => isFav ? removeFav.mutate() : addFav.mutate()}
                disabled={addFav.isPending || removeFav.isPending}
              >
                <Heart size={16} fill={isFav ? "#fff" : "none"} />
                {isFav ? "お気に入り済み" : "お気に入りに追加"}
              </button>
            )}
          </aside>
        </div>

        {/* 関連スポーツ */}
        {related && related.items.filter((s) => s.id !== id).length > 0 && (
          <section style={{ marginTop: "48px", borderTop: "1.5px solid var(--ms-border)", paddingTop: "32px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "24px",
                letterSpacing: "0.05em",
                marginBottom: "24px",
              }}
            >
              関連スポーツ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
              {related.items
                .filter((s) => s.id !== id)
                .slice(0, 4)
                .map((s) => (
                  <SportCard key={s.id} {...s} />
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "20px",
        letterSpacing: "0.05em",
        borderBottom: "1.5px solid var(--ms-border)",
        paddingBottom: "8px",
        marginBottom: "16px",
      }}
    >
      {children}
    </h2>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "var(--ms-muted)", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "14px", color: "var(--ink)" }}>{value}</p>
    </div>
  );
}
