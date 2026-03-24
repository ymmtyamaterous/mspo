import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

// マイページルート
export const Route = createFileRoute("/my")({
  component: MyLayout,
});

function MyLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) return <div style={{ padding: "64px", textAlign: "center", color: "var(--ms-muted)" }}>読み込み中...</div>;
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
          マイページ
        </h1>
        <p style={{ fontSize: "13px", color: "var(--ms-muted)", marginTop: "4px" }}>
          {session.user.name}
        </p>
        <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
          <SubTab to="/my/favorites">お気に入り</SubTab>
          <SubTab to="/my/submissions">自分の投稿</SubTab>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function SubTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        fontSize: "13px",
        letterSpacing: "0.05em",
        textDecoration: "none",
        color: "var(--ms-muted)",
        padding: "4px 0",
        borderBottom: "2px solid transparent",
      }}
      activeProps={{
        style: {
          color: "var(--ms-accent)",
          borderBottom: "2px solid var(--ms-accent)",
        },
      }}
    >
      {children}
    </Link>
  );
}
