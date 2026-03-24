import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shuffle } from "lucide-react";

import { CategoryGrid } from "@/components/category-grid";
import { PickupSection } from "@/components/pickup-section";
import { SearchBar } from "@/components/search-bar";
import { SportCard } from "@/components/sport-card";
import { SportsTicker } from "@/components/sports-ticker";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  head: () => ({
    meta: [{ title: "MinorSports — マイナースポーツ図鑑" }],
  }),
});

function HomeComponent() {
  const { data: categoriesData } = useQuery(orpc.categories.list.queryOptions());
  const { data: sportsData } = useQuery(
    orpc.sports.list.queryOptions({ input: { limit: 20, sortBy: "viewCount" } }),
  );
  const { data: newSportsData } = useQuery(
    orpc.sports.list.queryOptions({ input: { limit: 6, sortBy: "createdAt" } }),
  );
  const { data: pickupData } = useQuery(orpc.pickup.getCurrent.queryOptions());

  const categories = categoriesData ?? [];
  const topSports = sportsData?.items ?? [];
  const newSports = newSportsData?.items ?? [];
  const tickerNames = topSports.map((s) => s.name);
  const totalCount = sportsData?.total ?? 0;

  return (
    <div>
      {/* HERO セクション */}
      <section
        style={{
          borderBottom: "1.5px solid var(--ms-border)",
          padding: "64px 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--ms-muted)",
                  marginBottom: "16px",
                }}
              >
                DISCOVER THE UNKNOWN
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(48px, 8vw, 80px)",
                  letterSpacing: "0.03em",
                  lineHeight: 0.95,
                  marginBottom: "24px",
                  color: "var(--ink)",
                }}
              >
                KNOW
                <br />
                YOUR
                <br />
                <span style={{ color: "var(--ms-accent)" }}>SPORT</span>
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.8,
                  color: "var(--ms-muted)",
                  maxWidth: "400px",
                  marginBottom: "32px",
                }}
              >
                世界中のマイナースポーツを探索しよう。
                あなたの知らない競技があなたを待っている。
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  to="/sports"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 28px",
                    background: "var(--ms-accent)",
                    color: "#fff",
                    textDecoration: "none",
                    fontFamily: "var(--font-body)",
                    fontSize: "14px",
                    letterSpacing: "0.05em",
                  }}
                >
                  スポーツを探す <ArrowRight size={16} />
                </Link>
                <RandomSportButton />
              </div>
            </div>
            <div className="hidden lg:block">
              <div style={{ border: "1.5px solid var(--ms-border)", padding: "32px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ms-muted)",
                    marginBottom: "24px",
                  }}
                >
                  SITE STATS
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <StatBlock value={totalCount} label="スポーツ登録数" color="var(--ms-accent)" />
                  <StatBlock value={categories.length} label="カテゴリ数" color="var(--ms-accent2)" />
                  <StatBlock value={newSports.length} label="今週の新着" color="var(--ink)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ティッカー */}
      {tickerNames.length > 0 && <SportsTicker names={tickerNames} />}

      {/* 検索バー */}
      <section
        style={{
          background: "var(--search-bg)",
          borderBottom: "1.5px solid var(--ms-border)",
          padding: "32px 0",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ms-muted)",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            SEARCH SPORTS
          </p>
          <SearchBar />
        </div>
      </section>

      {/* カテゴリグリッド */}
      {categories.length > 0 && (
        <section style={{ borderBottom: "1.5px solid var(--ms-border)", padding: "48px 0" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="カテゴリ" sub="CATEGORIES" href="/categories" />
            <CategoryGrid categories={categories} />
          </div>
        </section>
      )}

      {/* 今週の特集 */}
      {pickupData && (
        <PickupSection main={pickupData.main} sideCards={pickupData.sideCards as any} />
      )}

      {/* 新着スポーツ */}
      {newSports.length > 0 && (
        <section style={{ borderBottom: "1.5px solid var(--ms-border)", padding: "48px 0" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="新着スポーツ" sub="LATEST" href="/sports" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {newSports.map((s) => (
                <SportCard key={s.id} {...s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function RandomSportButton() {
  const { data } = useQuery(orpc.sports.getRandom.queryOptions());
  return (
    <Link
      to="/sports/$id"
      params={{ id: data?.id ?? "" }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "14px 28px",
        border: "1.5px solid var(--ink)",
        color: "var(--ink)",
        textDecoration: "none",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        letterSpacing: "0.05em",
        opacity: data ? 1 : 0.5,
        pointerEvents: data ? "auto" : "none",
      }}
    >
      <Shuffle size={16} /> ランダム
    </Link>
  );
}

function StatBlock({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "44px",
          color,
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "10px", color: "var(--ms-muted)", letterSpacing: "0.05em" }}>
        {label}
      </div>
    </div>
  );
}

function SectionHeader({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: "32px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", letterSpacing: "0.05em" }}>
          {title}
        </h2>
        <span style={{ fontSize: "11px", color: "var(--ms-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {sub}
        </span>
      </div>
      <Link
        to={href}
        style={{
          fontSize: "12px",
          color: "var(--ms-muted)",
          textDecoration: "none",
          letterSpacing: "0.08em",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        すべて見る <ArrowRight size={12} />
      </Link>
    </div>
  );
}
