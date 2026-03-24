import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [{ title: "管理画面 — MinorSports" }],
  }),
});

function AdminLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div style={{ padding: "64px", textAlign: "center", color: "var(--ms-muted)" }}>
        読み込み中...
      </div>
    );
  }

  if (!session || (session.user as any).role !== "admin") {
    navigate({ to: "/" });
    return null;
  }

  const adminNavItems = [
    { to: "/admin", label: "ダッシュボード", exact: true },
    { to: "/admin/submissions", label: "投稿審査" },
    { to: "/admin/sports", label: "スポーツ管理" },
    { to: "/admin/categories", label: "カテゴリ管理" },
    { to: "/admin/pickup", label: "ピックアップ設定" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      {/* Admin top bar */}
      <div
        style={{
          background: "var(--ink)",
          color: "#f7f3ed",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: "32px",
          height: "48px",
          fontSize: "13px",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "0.1em" }}>
          ADMIN
        </span>
        {adminNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{ color: "#f7f3ed", textDecoration: "none", opacity: 0.7 }}
            activeProps={{ style: { opacity: 1, borderBottom: "2px solid var(--ms-accent)" } }}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <Link to="/" style={{ color: "var(--ms-muted)", textDecoration: "none", fontSize: "12px" }}>
            ← サイトへ戻る
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}
