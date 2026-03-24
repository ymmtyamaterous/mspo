import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function NavBar() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as { role?: string } | undefined;
  const isAdmin = user?.role === "admin";

  return (
    <nav
      style={{
        borderBottom: "1.5px solid var(--ms-border)",
        background: "var(--paper)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* ロゴ */}
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              letterSpacing: "0.05em",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            MINOR SPORTS
          </Link>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/sports">図鑑</NavLink>
            <NavLink to="/categories">カテゴリ</NavLink>
            <NavLink to="/ranking">ランキング</NavLink>
            <NavLink to="/submit">投稿する</NavLink>
            {isAdmin && <NavLink to="/admin">管理者</NavLink>}
          </div>

          {/* 右側 */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <UserMenu name={session.user.name} isAdmin={isAdmin} />
            ) : (
              <Link
                to="/login"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  padding: "8px 20px",
                  border: "1.5px solid var(--ink)",
                  color: "var(--ink)",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                }}
              >
                ログイン
              </Link>
            )}
            <Link
              to="/sports"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                padding: "8px 20px",
                background: "var(--ms-accent)",
                color: "#fff",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}
            >
              スポーツを探す
            </Link>
          </div>

          {/* モバイルメニューボタン */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="メニュー"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* モバイルドロワー */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--ms-border)",
            background: "var(--paper)",
            padding: "16px",
          }}
          className="md:hidden"
        >
          <div className="flex flex-col gap-4">
            <MobileNavLink to="/sports" onClick={() => setMobileOpen(false)}>図鑑</MobileNavLink>
            <MobileNavLink to="/categories" onClick={() => setMobileOpen(false)}>カテゴリ</MobileNavLink>
            <MobileNavLink to="/ranking" onClick={() => setMobileOpen(false)}>ランキング</MobileNavLink>
            <MobileNavLink to="/submit" onClick={() => setMobileOpen(false)}>投稿する</MobileNavLink>
            {isAdmin && (
              <MobileNavLink to="/admin" onClick={() => setMobileOpen(false)}>管理者</MobileNavLink>
            )}
            {session ? (
              <>
                <MobileNavLink to="/my/favorites" onClick={() => setMobileOpen(false)}>お気に入り</MobileNavLink>
                <MobileNavLink to="/my/submissions" onClick={() => setMobileOpen(false)}>自分の投稿</MobileNavLink>
                <button
                  type="button"
                  style={{ fontSize: "13px", color: "var(--ms-muted)", textAlign: "left" }}
                  onClick={() => {
                    authClient.signOut();
                    setMobileOpen(false);
                  }}
                >
                  ログアウト
                </button>
              </>
            ) : (
              <MobileNavLink to="/login" onClick={() => setMobileOpen(false)}>ログイン</MobileNavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        color: "var(--ink)",
        textDecoration: "none",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "var(--ink)",
        textDecoration: "none",
        letterSpacing: "0.05em",
      }}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function UserMenu({
  name,
  isAdmin,
}: {
  name: string;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          padding: "8px 16px",
          background: "var(--ink)",
          color: "var(--paper)",
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.05em",
        }}
        onClick={() => setOpen(!open)}
      >
        {name}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            background: "var(--paper)",
            border: "1.5px solid var(--ms-border)",
            minWidth: "160px",
            zIndex: 100,
          }}
        >
          <DropItem to="/my/favorites" onClick={() => setOpen(false)}>お気に入り</DropItem>
          <DropItem to="/my/submissions" onClick={() => setOpen(false)}>自分の投稿</DropItem>
          {isAdmin && (
            <DropItem to="/admin" onClick={() => setOpen(false)}>管理者ダッシュボード</DropItem>
          )}
          <button
            type="button"
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 16px",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              background: "transparent",
              border: "none",
              borderTop: "1px solid var(--ms-border)",
              cursor: "pointer",
              color: "var(--ms-muted)",
            }}
            onClick={() => {
              authClient.signOut();
              setOpen(false);
            }}
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}

function DropItem({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: "10px 16px",
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        color: "var(--ink)",
        textDecoration: "none",
      }}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
